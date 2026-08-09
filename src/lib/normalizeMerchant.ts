/**
 * Normalizes a raw merchant description from a bank statement into a
 * stable key so the same merchant groups together even when the raw
 * text varies between charges.
 *
 * Examples this needs to handle:
 *   "NETFLIX.COM 8014561234 CA"      -> "netflix"
 *   "Netflix.com*Ac7hj9"             -> "netflix"
 *   "SPOTIFY USA   4029384756"       -> "spotify"
 *   "AMZN Mktp US*2K4RT8HF3"         -> "amzn mktp us" (kept distinct from amazon retail)
 */
export function normalizeMerchant(raw: string): string {
  let name = raw.toLowerCase();

  // Strip common processor/reference noise: long digit runs, card auth codes,
  // trailing state abbreviations, asterisked transaction IDs.
  name = name.replace(/\*[a-z0-9]{4,}/g, ""); // *AC7HJ9 style ids
  name = name.replace(/\b\d{4,}\b/g, ""); // long digit sequences (phone/ref numbers)
  name = name.replace(/\b[a-z]{2}\b$/g, ""); // trailing 2-letter state code
  name = name.replace(/\.(com|net|org|io)\b/g, ""); // domains
  name = name.replace(/[^a-z0-9\s]/g, " "); // punctuation -> space
  name = name.replace(/\s+/g, " ").trim();

  return name;
}
