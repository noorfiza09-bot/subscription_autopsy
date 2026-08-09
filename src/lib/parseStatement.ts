import Papa from "papaparse";
import type { RawTransaction } from "./detectSubscriptions";

/**
 * Parses a bank/card CSV export into normalized transactions.
 *
 * Bank CSV exports vary a lot in column naming. This looks for common
 * header variants; adjust COLUMN_ALIASES as you test against real
 * statements from your own bank.
 */
const DATE_KEYS = ["date", "transaction date", "posted date"];
const DESC_KEYS = ["description", "merchant", "narration", "details", "particulars"];
const AMOUNT_KEYS = ["amount", "debit", "withdrawal", "amount (inr)"];

export function parseStatementCsv(csvText: string): RawTransaction[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data;
  const transactions: RawTransaction[] = [];

  for (const row of rows) {
    const keys = Object.keys(row).map((k) => k.trim().toLowerCase());
    const dateKey = findKey(row, keys, DATE_KEYS);
    const descKey = findKey(row, keys, DESC_KEYS);
    const amountKey = findKey(row, keys, AMOUNT_KEYS);

    if (!dateKey || !descKey || !amountKey) continue;

    const dateVal = row[dateKey];
    const amountVal = row[amountKey];
    const date = parseDate(dateVal);
    const amount = Math.abs(parseFloat((amountVal || "0").replace(/[^0-9.-]/g, "")));

    if (isNaN(date.getTime()) || isNaN(amount) || amount === 0) continue;

    transactions.push({
      date,
      merchantRaw: row[descKey]?.trim() ?? "",
      amount,
    });
  }

  return transactions;
}

/**
 * JS's `new Date("02/03/2026")` assumes US MM/DD/YYYY and will silently
 * (and wrongly) parse this as Feb 3 instead of March 2. Indian bank
 * statements use DD/MM/YYYY, so we parse that format explicitly rather
 * than trusting the ambiguous built-in parser. ISO dates (YYYY-MM-DD)
 * are unambiguous and pass through to the native parser as-is.
 */
function parseDate(raw: string): Date {
  const value = (raw || "").trim();

  // ISO format (YYYY-MM-DD or with time) — unambiguous, safe to use natively.
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value);
  }

  // DD/MM/YYYY or DD-MM-YYYY (the common Indian bank statement format).
  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // Fall back to native parsing for anything else (last resort — may be
  // ambiguous, but better than nothing for unexpected formats).
  return new Date(value);
}

function findKey(
  row: Record<string, string>,
  lowerKeys: string[],
  candidates: string[]
): string | null {
  const originalKeys = Object.keys(row);
  for (const candidate of candidates) {
    const idx = lowerKeys.indexOf(candidate);
    if (idx !== -1) return originalKeys[idx];
  }
  return null;
}
