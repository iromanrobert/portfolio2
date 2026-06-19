import { Resend } from "resend";
import { render } from "@react-email/render";
import NotificationEmail from "../../../emails/notification";
import ConfirmationEmail from "../../../emails/confirmation";

const FROM   = process.env.RESEND_FROM_EMAIL!;
const TO     = process.env.RESEND_TO_EMAIL!;

export async function POST(request: Request) {
  // Instantiate per-request — at module scope this throws during `next build`
  // (page-data collection) when RESEND_API_KEY isn't present in the env.
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { name, email, message } = await request.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }

  const [notifHtml, confirmHtml] = await Promise.all([
    render(NotificationEmail({ name, email, message })),
    render(ConfirmationEmail({ name })),
  ]);

  const [notif, confirm] = await Promise.all([
    resend.emails.send({
      from:    `Portfolio <${FROM}>`,
      to:      TO,
      replyTo: email,
      subject: `New message from ${name}`,
      html:    notifHtml,
    }),
    resend.emails.send({
      from:    `Roman Robert <${FROM}>`,
      to:      email,
      subject: "Got your message",
      html:    confirmHtml,
    }),
  ]);

  if (notif.error || confirm.error) {
    const err = notif.error ?? confirm.error;
    console.error("[contact] Resend error:", err);
    return Response.json({ error: err!.message }, { status: 500 });
  }

  console.log("[contact] Sent — notif:", notif.data?.id, "confirm:", confirm.data?.id);
  return Response.json({ success: true });
}
