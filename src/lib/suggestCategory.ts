/**
 * Suggests a category for a subscription based on keywords in its
 * normalized merchant name. This is a starting guess, not a final
 * answer — users can always override it from the dashboard, and their
 * manual choice is never overwritten by this on subsequent uploads
 * (see upload/route.ts: only applied when category is not already set).
 */
const CATEGORY_KEYWORDS: { category: string; keywords: string[] }[] = [
  {
    category: "Streaming",
    keywords: ["netflix", "spotify", "youtube", "prime video", "hotstar", "sonyliv", "zee5", "apple music", "apple tv"],
  },
  {
    category: "Fitness",
    keywords: ["cult", "gym", "fitness", "yoga", "peloton"],
  },
  {
    category: "Software",
    keywords: ["google one", "icloud", "dropbox", "notion", "adobe", "microsoft", "github", "openai", "chatgpt", "canva"],
  },
  {
    category: "Shopping",
    keywords: ["amazon prime", "flipkart plus", "myntra insider"],
  },
  {
    category: "Utilities",
    keywords: ["electricity", "broadband", "wifi", "mobile recharge", "jio", "airtel", "vi ", "vodafone"],
  },
];

export function suggestCategory(merchantNormalized: string): string | null {
  const name = merchantNormalized.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => name.includes(kw))) {
      return category;
    }
  }
  return null;
}
