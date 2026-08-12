/**
 * JS's `new Date("02/03/2026")` assumes US MM/DD/YYYY and will silently
 * (and wrongly) parse this as Feb 3 instead of March 2. Indian bank
 * statements use DD/MM/YYYY, so we parse that format explicitly rather
 * than trusting the ambiguous built-in parser. ISO dates (YYYY-MM-DD)
 * are unambiguous and pass through to the native parser as-is.
 */
export function parseDate(raw: string): Date {
  const value = (raw || "").trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value);
  }

  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(value);
}
