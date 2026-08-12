import Papa from "papaparse";
import type { RawTransaction } from "./detectSubscriptions";
import { parseDate } from "./dateUtils";

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
