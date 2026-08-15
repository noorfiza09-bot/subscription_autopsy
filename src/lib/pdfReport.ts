import { jsPDF } from "jspdf";

type Subscription = {
  displayName: string;
  amount: number;
  frequency: string;
  category: string | null;
  nextExpectedDate: string | null;
  isConfirmed: boolean;
};

export function generatePdfReport(
  subs: Subscription[],
  monthlyTotal: number,
  monthlyBudget: number | null
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 50;
  let y = 60;

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(111, 207, 151); // sage
  doc.text("ITEMIZED RECEIPT · SUBSCRIPTION REPORT", marginX, y);

  y += 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 27, 43); // ink
  doc.text("Your recurring spend", marginX, y);

  y += 20;
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor(92, 107, 122); // slate
  doc.text(
    `${subs.length} subscription${subs.length !== 1 ? "s" : ""} · roughly Rs.${monthlyTotal.toFixed(2)}/month · generated ${new Date().toLocaleDateString()}`,
    marginX,
    y
  );

  if (monthlyBudget != null) {
    y += 16;
    const overBudget = monthlyTotal > monthlyBudget;
    doc.setTextColor(overBudget ? 232 : 111, overBudget ? 93 : 207, overBudget ? 78 : 151);
    doc.text(
      overBudget
        ? `Over budget: Rs.${(monthlyTotal - monthlyBudget).toFixed(2)} above your Rs.${monthlyBudget.toFixed(2)} target`
        : `Within budget: Rs.${(monthlyBudget - monthlyTotal).toFixed(2)} under your Rs.${monthlyBudget.toFixed(2)} target`,
      marginX,
      y
    );
  }

  y += 30;
  doc.setDrawColor(15, 27, 43);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(marginX, y, 545, y);
  doc.setLineDashPattern([], 0);

  y += 24;
  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 27, 43);
  doc.text("MERCHANT", marginX, y);
  doc.text("CATEGORY", 260, y);
  doc.text("FREQUENCY", 370, y);
  doc.text("AMOUNT", 545, y, { align: "right" });

  y += 10;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(marginX, y, 545, y);
  doc.setLineDashPattern([], 0);

  const sorted = [...subs].sort((a, b) => b.amount - a.amount);

  for (const sub of sorted) {
    y += 20;
    if (y > 760) {
      doc.addPage();
      y = 60;
    }
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 27, 43);
    doc.text(sub.displayName, marginX, y);
    doc.text(sub.category ?? "Uncategorized", 260, y);
    doc.text(sub.frequency.toLowerCase(), 370, y);
    doc.text(`Rs.${sub.amount.toFixed(2)}`, 545, y, { align: "right" });

    if (!sub.isConfirmed) {
      doc.setTextColor(232, 163, 61); // amber
      doc.setFontSize(7);
      doc.text("UNCONFIRMED", marginX, y + 10);
    }
  }

  y += 30;
  doc.setLineDashPattern([2, 2], 0);
  doc.line(marginX, y, 545, y);
  doc.setLineDashPattern([], 0);

  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 27, 43);
  doc.text(`Total: Rs.${monthlyTotal.toFixed(2)}/month`, 545, y, { align: "right" });

  doc.save("subscription-report.pdf");
}
