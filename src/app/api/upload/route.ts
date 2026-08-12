import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseStatementCsv } from "@/lib/parseStatement";
import { parseStatementPdfText } from "@/lib/parseStatementPdf";
import { detectSubscriptions, RawTransaction } from "@/lib/detectSubscriptions";
import { normalizeMerchant } from "@/lib/normalizeMerchant";
import { suggestCategory } from "@/lib/suggestCategory";

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
      // pdf-parse expects a Buffer, not a browser File/Blob.
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Lazy-required to avoid pdf-parse's debug-mode file read running at
      // module load time in some bundling setups.
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

    // Re-run detection across ALL of the user's transactions, not just this
    // upload, so subscriptions spanning multiple statements are caught.
    const allTx = await prisma.transaction.findMany({ where: { userId } });
    const detected = detectSubscriptions(
      allTx.map((t) => ({ date: t.date, merchantRaw: t.merchantRaw, amount: t.amount }))
    );

    for (const sub of detected) {
      const existing = await prisma.subscription.findUnique({
        where: {
          userId_merchantNormalized: {
            userId,
            merchantNormalized: sub.merchantNormalized,
          },
        },
      });

      const savedSub = await prisma.subscription.upsert({
        where: {
          userId_merchantNormalized: {
            userId,
            merchantNormalized: sub.merchantNormalized,
          },
        },
        update: {
          amount: sub.amount,
          previousAmount: sub.priceHike ? sub.priceHike.from : existing?.previousAmount ?? null,
          frequency: sub.frequency,
          lastChargeDate: sub.lastChargeDate,
          nextExpectedDate: sub.nextExpectedDate,
        },
        create: {
          userId,
          merchantNormalized: sub.merchantNormalized,
          displayName: sub.displayName,
          amount: sub.amount,
          previousAmount: sub.priceHike ? sub.priceHike.from : null,
          frequency: sub.frequency,
          category: suggestCategory(sub.merchantNormalized),
          lastChargeDate: sub.lastChargeDate,
          nextExpectedDate: sub.nextExpectedDate,
        },
      });

      // Link every transaction from this merchant to its subscription so
      // we can later query real spend history (e.g. the trend chart)
      // instead of only ever seeing the current snapshot.
      await prisma.transaction.updateMany({
        where: { userId, merchantNormalized: sub.merchantNormalized },
        data: { subscriptionId: savedSub.id },
      });
    }

    return NextResponse.json({
      transactionsImported: parsedTransactions.length,
      subscriptionsDetected: detected.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
