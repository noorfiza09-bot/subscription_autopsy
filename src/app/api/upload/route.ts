import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseStatementCsv } from "@/lib/parseStatement";
import { parseStatementPdfText } from "@/lib/parseStatementPdf";
import { RawTransaction } from "@/lib/detectSubscriptions";
import { normalizeMerchant } from "@/lib/normalizeMerchant";
import { recomputeSubscriptionsForUser } from "@/lib/recomputeSubscriptions";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";

    let parsedTransactions: RawTransaction[];

    if (isPdf) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer);
      parsedTransactions = parseStatementPdfText(pdfData.text);
    } else {
      const csvText = await file.text();
      parsedTransactions = parseStatementCsv(csvText);
    }

    if (parsedTransactions.length === 0) {
      return NextResponse.json(
        {
          error: isPdf
            ? "Couldn't find any transaction lines in that PDF. It may be a scanned/image-based statement rather than a text-based one, or your bank's layout doesn't match the expected pattern yet."
            : "Couldn't find any valid transactions in that file. Check the CSV columns.",
        },
        { status: 422 }
      );
    }

    const statement = await prisma.statement.create({
      data: { userId, filename: file.name },
    });

    await prisma.transaction.createMany({
      data: parsedTransactions.map((t) => ({
        userId,
        statementId: statement.id,
        date: t.date,
        merchantRaw: t.merchantRaw,
        merchantNormalized: normalizeMerchant(t.merchantRaw),
        amount: t.amount,
      })),
    });

    const subscriptionsDetected = await recomputeSubscriptionsForUser(userId);

    return NextResponse.json({
      transactionsImported: parsedTransactions.length,
      subscriptionsDetected,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
