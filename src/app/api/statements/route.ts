import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const statements = await prisma.statement.findMany({
    where: { userId: session.user.id },
    orderBy: { uploadedAt: "desc" },
    include: { _count: { select: { transactions: true } } },
  });

  return NextResponse.json(
    statements.map((s) => ({
      id: s.id,
      filename: s.filename,
      uploadedAt: s.uploadedAt,
      transactionCount: s._count.transactions,
    }))
  );
}
