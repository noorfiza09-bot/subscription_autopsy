import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Dismissing a possible trial creates a dismissed Subscription row for
 * that merchant — reusing the existing isDismissed mechanism rather than
 * adding a whole new table just to remember "the user already saw and
 * dismissed this." It also means /api/subscriptions/trials will
 * naturally stop surfacing it next time (it excludes anything with an
 * existing Subscription row, dismissed or not).
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { merchantNormalized, displayName, amount } = await req.json();
  if (!merchantNormalized || !displayName || amount == null) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  await prisma.subscription.upsert({
    where: {
      userId_merchantNormalized: { userId: session.user.id, merchantNormalized },
    },
    update: { isDismissed: true },
    create: {
      userId: session.user.id,
      merchantNormalized,
      displayName,
      amount,
      frequency: "UNKNOWN",
      lastChargeDate: new Date(),
      isDismissed: true,
    },
  });

  return NextResponse.json({ success: true });
}
