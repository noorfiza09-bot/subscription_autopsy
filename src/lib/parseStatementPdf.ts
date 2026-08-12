import type { RawTransaction } from "./detectSubscriptions";
import { parseDate } from "./dateUtils";

/**
 * Parses transactions out of a bank statement PDF's extracted text.
 *
 * This only works on text-based PDFs (the normal kind banks generate) —
 * not scanned/photographed statements, which would need OCR first.
 *
 * Bank statement PDFs don't have the clean column structure a CSV does,
 * so instead of header matching we look for lines that match the shape
 * of a transaction row: a date, followed by a description, followed by
 * an amount. This is heuristic and will need tuning against your bank's
 * actual PDF layout — see the regex below.
 */
export function parseStatementPdfText(text: string): RawTransaction[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const transactions: RawTransaction[] = [];

  // Matches: <date>  <description...>  <amount>  [optional Dr/Cr/DR/CR]
  // Date: DD/MM/YYYY or DD-MM-YYYY
  // Amount: digits with optional commas and decimal point, e.g. 1,999.00
  const lineRegex =
    /^(\d{1,2}[/-]\d{1,2}[/-]\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(?:dr|cr|db|cr\.)?$/i;

  for (const line of lines) {
    const match = line.match(lineRegex);
    if (!match) continue;

    const [, dateStr, description, amountStr] = match;
    const date = parseDate(dateStr);
    const amount = Math.abs(parseFloat(amountStr.replace(/,/g, "")));

    if (isNaN(date.getTime()) || isNaN(amount) || amount === 0) continue;

    transactions.push({
      date,
      merchantRaw: description.trim(),
      amount,
    });
  }

  return transactions;
}
