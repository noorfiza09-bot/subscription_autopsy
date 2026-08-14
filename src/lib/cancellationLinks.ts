/**
 * Maps a normalized merchant name to where you'd actually go to cancel it.
 * Keyword-matched the same way suggestCategory.ts works — first match
 * wins, so more specific keywords should stay near the top of related
 * groups if you extend this list.
 *
 * These URLs point to each service's account/subscription management
 * page as of when this was written — services move these pages around
 * fairly often, so treat this as "a good starting point," not a
 * guarantee it'll land exactly on the cancel button.
 */
type CancellationInfo = { url: string; note?: string };

const CANCELLATION_LINKS: { keywords: string[]; info: CancellationInfo }[] = [
  { keywords: ["netflix"], info: { url: "https://www.netflix.com/cancelplan" } },
  { keywords: ["spotify"], info: { url: "https://www.spotify.com/account/subscription/" } },
  {
    keywords: ["amazon prime", "amzn prime"],
    info: { url: "https://www.amazon.in/mc/pipelines/cancellation" },
  },
  {
    keywords: ["youtube"],
    info: { url: "https://www.youtube.com/paid_memberships" },
  },
  {
    keywords: ["google one", "google storage"],
    info: { url: "https://one.google.com/settings" },
  },
  {
    keywords: ["hotstar", "disney"],
    info: { url: "https://www.hotstar.com/in/subscription", note: "Manage from Account settings" },
  },
  { keywords: ["sonyliv"], info: { url: "https://www.sonyliv.com/subscribe" } },
  { keywords: ["zee5"], info: { url: "https://www.zee5.com/subscription" } },
  {
    keywords: ["apple music", "apple tv", "icloud"],
    info: { url: "https://support.apple.com/en-us/HT202039", note: "Manage subscriptions in Settings on your device" },
  },
  {
    keywords: ["cult", "cultfit", "curefit"],
    info: { url: "https://www.cult.fit/", note: "Cancel from the Cult.fit app > Account > Manage membership" },
  },
  { keywords: ["adobe"], info: { url: "https://account.adobe.com/plans" } },
  {
    keywords: ["microsoft", "office 365"],
    info: { url: "https://account.microsoft.com/services" },
  },
  { keywords: ["dropbox"], info: { url: "https://www.dropbox.com/account/billing" } },
  { keywords: ["notion"], info: { url: "https://www.notion.so/my-integrations", note: "Billing is under Settings > Plans" } },
  { keywords: ["canva"], info: { url: "https://www.canva.com/settings/billing" } },
  { keywords: ["github"], info: { url: "https://github.com/settings/billing" } },
  {
    keywords: ["openai", "chatgpt"],
    info: { url: "https://chat.openai.com/#settings/Subscription" },
  },
];

export function getCancellationInfo(merchantNormalized: string): CancellationInfo | null {
  const name = merchantNormalized.toLowerCase();
  for (const { keywords, info } of CANCELLATION_LINKS) {
    if (keywords.some((kw) => name.includes(kw))) {
      return info;
    }
  }
  return null;
}
