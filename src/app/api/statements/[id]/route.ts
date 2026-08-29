import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeSubscriptionsForUser } from "@/lib/recomputeSubscriptions";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const statement = await prisma.statement.findUnique({ where: { id: params.id } });
  if (!statement || statement.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Deleting the Statement cascades to its Transactions (onDelete: Cascade
  // in schema.prisma), but detected Subscriptions are separate rows that
  // won't automatically update — recompute is what actually cleans those
  // up if this statement was the only source for a given merchant.
  await prisma.statement.delete({ where: { id: params.id } });
  await recomputeSubscriptionsForUser(session.user.id);

  return NextResponse.json({ success: true });
}
