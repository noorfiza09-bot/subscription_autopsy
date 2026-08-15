import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAY_MS = 1000 * 60 * 60 * 24;

function monthlyEquivalent(amount: number, frequency: string) {
  const multiplier = frequency === "YEARLY" ? 1 / 12 : frequency === "WEEKLY" ? 4.33 : 1;
  return amount * multiplier;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const cancelled = await prisma.subscription.findMany({
    where: { userId: session.user.id, wasCancelled: true },
    orderBy: { cancelledAt: "desc" },
  });

  const now = new Date();
  let totalSaved = 0;
  let monthlySavings = 0;

  const items = cancelled.map((sub) => {
    const monthly = monthlyEquivalent(sub.amount, sub.frequency);
    monthlySavings += monthly;

    const daysSinceCancelled = sub.cancelledAt
      ? Math.max(0, (now.getTime() - sub.cancelledAt.getTime()) / DAY_MS)
      : 0;
    // At least count the first month you cancelled, even if it was
    // moments ago — otherwise "saved so far" looks like zero the instant
    // you cancel something, which feels wrong for what's meant to be an
    // encouraging number.
    const monthsElapsed = Math.max(1, daysSinceCancelled / 30);
    const savedSoFar = monthly * monthsElapsed;
    totalSaved += savedSoFar;

    return {
      id: sub.id,
      displayName: sub.displayName,
      amount: sub.amount,
      frequency: sub.frequency,
      cancelledAt: sub.cancelledAt,
      savedSoFar: Math.round(savedSoFar * 100) / 100,
    };
  });

  return NextResponse.json({
    items,
    totalSaved: Math.round(totalSaved * 100) / 100,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
  });
}
