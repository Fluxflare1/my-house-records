import "server-only";
import { getNotificationPorts } from "./dispatcher";

function isTrue(v?: string) {
  return String(v || "").toLowerCase() === "true";
}

export async function notifyAdmin(params: { subject: string; text: string }) {
  const adminPhone = (process.env.ADMIN_NOTIFY_PHONE || "").trim();
  const adminEmail = (process.env.ADMIN_NOTIFY_EMAIL || "").trim();

  const enable = isTrue(process.env.NOTIFY_ADMIN);
  if (!enable) return;

  const { whatsapp, email } = getNotificationPorts();

  if (adminPhone) {
    await whatsapp.sendWhatsApp({ toE164: adminPhone, text: params.text });
  }
  if (adminEmail) {
    await email.sendEmail({ toEmail: adminEmail, subject: params.subject, text: params.text });
  }
}
