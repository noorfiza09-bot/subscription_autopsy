import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCancellationInfo } from "@/lib/cancellationLinks";

/**
 * A "possible trial" is a merchant that:
 *  - has charged you exactly once (a genuine subscription needs 2+
 *    occurrences to be detected by detectSubscriptions.ts — this catches
 *    the gap before that second charge happens)
 *  - matches a known subscription service (reusing the same curated
 *    keyword list cancellation links are matched against, rather than
 *    maintaining a second list that could drift out of sync)
 *  - doesn't already have a Subscription row (active, confirmed, or
 *    dismissed) — if it's already being tracked, it doesn't need a
 *    separate "watch out" flag.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const userId = session.user.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const existingSubs = await prisma.subscription.findMany({
    where: { userId },
    select: { merchantNormalized: true },
  });
  const trackedMerchants = new Set(existingSubs.map((s) => s.merchantNormalized));

  const byMerchant = new Map<string, typeof transactions>();
  for (const tx of transactions) {
    const list = byMerchant.get(tx.merchantNormalized) ?? [];
    list.push(tx);
    byMerchant.set(tx.merchantNormalized, list);
  }

  const trials = [];
  for (const [merchant, txs] of byMerchant) {
    if (txs.length !== 1) continue;
    if (trackedMerchants.has(merchant)) continue;

    const info = getCancellationInfo(merchant);
    if (!info) continue;

    trials.push({
      merchantNormalized: merchant,
      displayName: titleCase(merchant),
      amount: txs[0].amount,
      date: txs[0].date,
      cancellationUrl: info.url,
    });
  }

  return NextResponse.json(trials);
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
