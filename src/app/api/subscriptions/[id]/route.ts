import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Ownership check — make sure this subscription actually belongs to the
  // signed-in user before letting them modify it.
  const existing = await prisma.subscription.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await req.json();
  const { isConfirmed, isDismissed, category, wasCancelled } = body as {
    isConfirmed?: boolean;
    isDismissed?: boolean;
    category?: string;
    wasCancelled?: boolean;
  };

  const updated = await prisma.subscription.update({
    where: { id: params.id },
    data: {
      ...(isConfirmed !== undefined && { isConfirmed }),
      ...(isDismissed !== undefined && { isDismissed }),
      ...(category !== undefined && { category }),
      // Cancelling is distinct from a plain "not a subscription" dismiss —
      // it records when it happened so the savings tracker can compute
      // how long you've been saving that money.
      ...(wasCancelled !== undefined && {
        wasCancelled,
        cancelledAt: wasCancelled ? new Date() : null,
      }),
    },
  });

  return NextResponse.json(updated);
}
