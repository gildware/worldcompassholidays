/**
 * Lightweight outbound mail.
 * - With RESEND_API_KEY: sends via Resend HTTPS API (no extra npm package).
 * - Without: logs the message and returns ok (local/dev never blocks ops).
 */

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type MailResult = {
  ok: boolean;
  mode: "resend" | "log";
  id?: string;
  error?: string;
};

function fromAddress() {
  return (
    process.env.MAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "World Compass Holidays <onboarding@resend.dev>"
  );
}

export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const to = message.to.trim();
  if (!to || !to.includes("@")) {
    return { ok: false, mode: "log", error: "Missing recipient email." };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("[mail:log]", {
      to,
      subject: message.subject,
      text: message.text.slice(0, 500),
    });
    return { ok: true, mode: "log" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [to],
        subject: message.subject,
        text: message.text,
        html: message.html ?? undefined,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (!response.ok) {
      const error = payload.message || `Mail provider returned ${response.status}`;
      console.error("[mail:resend]", error);
      return { ok: false, mode: "resend", error };
    }
    return { ok: true, mode: "resend", id: payload.id };
  } catch (error) {
    const text = error instanceof Error ? error.message : "Mail send failed.";
    console.error("[mail:resend]", text);
    return { ok: false, mode: "resend", error: text };
  }
}
