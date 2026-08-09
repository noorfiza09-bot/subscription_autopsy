import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseStatementCsv } from "@/lib/parseStatement";
import { detectSubscriptions } from "@/lib/detectSubscriptions";
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

    const csvText = await file.text();
    const parsedTransactions = parseStatementCsv(csvText);

    if (parsedTransactions.length === 0) {
      return NextResponse.json(
        { error: "Couldn't find any valid transactions in that file. Check the CSV columns." },
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

      await prisma.subscription.upsert({
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
