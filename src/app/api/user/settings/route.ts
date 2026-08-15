import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailNotificationsEnabled: true, monthlyBudget: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json();
  const { emailNotificationsEnabled, monthlyBudget } = body as {
    emailNotificationsEnabled?: boolean;
    monthlyBudget?: number | null;
  };

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(emailNotificationsEnabled !== undefined && {
        emailNotificationsEnabled: Boolean(emailNotificationsEnabled),
      }),
      ...(monthlyBudget !== undefined && {
        monthlyBudget: monthlyBudget === null ? null : Number(monthlyBudget),
      }),
    },
    select: { email: true, emailNotificationsEnabled: true, monthlyBudget: true },
  });

  return NextResponse.json(updated);
}
