import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Only transactions linked to a confirmed-or-detected subscription count
  // as "recurring spend" here — one-off purchases are excluded even if
  // they happen to share a merchant with a subscription.
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      subscriptionId: { not: null },
      subscription: { isDismissed: false },
    },
    select: { date: true, amount: true },
    orderBy: { date: "asc" },
  });

  const monthTotals = new Map<string, number>();
  for (const tx of transactions) {
    const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + tx.amount);
  }

  const trend = Array.from(monthTotals.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, total]) => ({ month, total: Math.round(total * 100) / 100 }));

  return NextResponse.json(trend);
}
