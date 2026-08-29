import { prisma } from "./prisma";
import { detectSubscriptions } from "./detectSubscriptions";
import { suggestCategory } from "./suggestCategory";

/**
 * Re-runs detection across ALL of a user's current transactions and
 * upserts the resulting subscriptions. Used both right after a new
 * upload, and after deleting a statement (since removing transactions
 * can mean a subscription no longer has enough occurrences to still
 * count as recurring).
 */
export async function recomputeSubscriptionsForUser(userId: string) {
  const allTx = await prisma.transaction.findMany({ where: { userId } });
  const detected = detectSubscriptions(
    allTx.map((t) => ({ date: t.date, merchantRaw: t.merchantRaw, amount: t.amount }))
  );

  for (const sub of detected) {
    const existing = await prisma.subscription.findUnique({
      where: { userId_merchantNormalized: { userId, merchantNormalized: sub.merchantNormalized } },
    });

    const savedSub = await prisma.subscription.upsert({
      where: { userId_merchantNormalized: { userId, merchantNormalized: sub.merchantNormalized } },
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

    await prisma.transaction.updateMany({
      where: { userId, merchantNormalized: sub.merchantNormalized },
      data: { subscriptionId: savedSub.id },
    });
  }

  // Clean up subscriptions that no longer have enough remaining
  // transactions to count as recurring (e.g. after a statement was
  // deleted). Deliberately excludes anything the user already dismissed
  // or cancelled — those represent real history/decisions and shouldn't
  // silently disappear just because the underlying transaction set
  // changed shape.
  const detectedKeys = new Set(detected.map((d) => d.merchantNormalized));
  await prisma.subscription.deleteMany({
    where: {
      userId,
      isDismissed: false,
      merchantNormalized: { notIn: Array.from(detectedKeys) },
    },
  });

  return detected.length;
}
