import { Resend } from "resend";

// Resend's sandbox sender — works without verifying your own domain, but
// can only send to the email address you signed up to Resend with. Swap
// this for a verified domain address (e.g. reminders@yourdomain.com) once
// you've verified a domain in the Resend dashboard, so you can email any
// user, not just yourself.
const FROM_ADDRESS = process.env.EMAIL_FROM || "Subscription Autopsy <onboarding@resend.dev>";

export type UpcomingRenewal = {
  displayName: string;
  amount: number;
  nextExpectedDate: Date;
};

export async function sendRenewalReminderEmail(to: string, renewals: UpcomingRenewal[]) {
  // Created here, not at module load time — the Resend SDK throws
  // immediately if the API key is missing, which would otherwise crash
  // the build step the moment this module gets imported (e.g. Vercel
  // analyzing the /api/cron/reminders route), even if the key is only
  // actually needed at request time.
  const resend = new Resend(process.env.RESEND_API_KEY);

  const rows = renewals
    .map(
      (r) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(r.displayName)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">₹${r.amount.toFixed(2)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;color:#5C6B7A;">${r.nextExpectedDate.toLocaleDateString()}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <p style="text-transform:uppercase;letter-spacing:1px;font-size:11px;color:#6FCF97;">
        Itemized receipt &middot; upcoming renewals
      </p>
      <h2 style="margin-top:4px;">Charges landing soon</h2>
      <p style="color:#5C6B7A;">These subscriptions are due to renew in the next few days:</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        ${rows}
      </table>
      <p style="color:#5C6B7A;font-size:13px;margin-top:20px;">
        Didn't expect this? Log in to Subscription Autopsy and mark it as
        "Not a subscription" if it was detected in error.
      </p>
    </div>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${renewals.length} subscription${renewals.length !== 1 ? "s" : ""} renewing soon`,
    html,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
