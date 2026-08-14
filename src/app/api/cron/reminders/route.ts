import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRenewalReminderEmail } from "@/lib/email";

const REMINDER_WINDOW_DAYS = 3;
const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Runs on a schedule (see vercel.json) rather than being triggered by any
 * user action — that's the point of a cron job. Protected by CRON_SECRET
 * so random requests to this URL can't trigger a mass email blast.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_DAYS * DAY_MS);

  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      isDismissed: false,
      nextExpectedDate: { gte: now, lte: windowEnd },
      user: { emailNotificationsEnabled: true },
      OR: [
        { lastReminderSentAt: null },
        // Don't re-remind for the same renewal cycle: only send again if
        // the last reminder was sent before this cycle's renewal window
        // opened (i.e. it was for an earlier charge, not this one).
        { lastReminderSentAt: { lt: new Date(windowEnd.getTime() - 30 * DAY_MS) } },
      ],
    },
    include: { user: true },
  });

  // Group by user so someone with 3 renewals this week gets 1 email, not 3.
  const byUser = new Map<string, { email: string; subs: typeof dueSubscriptions }>();
  for (const sub of dueSubscriptions) {
    const entry = byUser.get(sub.userId) ?? { email: sub.user.email, subs: [] };
    entry.subs.push(sub);
    byUser.set(sub.userId, entry);
  }

  let emailsSent = 0;
  const errors: string[] = [];

  for (const [, { email, subs }] of byUser) {
    try {
      await sendRenewalReminderEmail(
        email,
        subs.map((s) => ({
          displayName: s.displayName,
          amount: s.amount,
          nextExpectedDate: s.nextExpectedDate!,
        }))
      );
      emailsSent++;

      await prisma.subscription.updateMany({
        where: { id: { in: subs.map((s) => s.id) } },
        data: { lastReminderSentAt: now },
      });
    } catch (err) {
      errors.push(`${email}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  return NextResponse.json({
    checked: dueSubscriptions.length,
    emailsSent,
    errors,
  });
}
