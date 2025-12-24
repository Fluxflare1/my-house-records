import "server-only";
import { EmailPort, WhatsAppPort } from "./ports";
import { NoopEmailProvider, NoopWhatsAppProvider } from "./providers/noop";
import { SmtpEmailProvider } from "./providers/email-smtp";
import { MetaWhatsAppProvider } from "./providers/whatsapp-meta";

function isTrue(v?: string) {
  return String(v || "").toLowerCase() === "true";
}

export function getNotificationPorts(): { whatsapp: WhatsAppPort; email: EmailPort } {
  // toggles
  const enableWhatsApp = isTrue(process.env.NOTIFY_WHATSAPP);
  const enableEmail = isTrue(process.env.NOTIFY_EMAIL);

  // providers
  const waProvider = (process.env.WHATSAPP_PROVIDER || "noop").toLowerCase();
  const emailProvider = (process.env.EMAIL_PROVIDER || "noop").toLowerCase();

  const whatsapp: WhatsAppPort = !enableWhatsApp
    ? new NoopWhatsAppProvider()
    : waProvider === "meta"
      ? new MetaWhatsAppProvider()
      : new NoopWhatsAppProvider();

  const email: EmailPort = !enableEmail
    ? new NoopEmailProvider()
    : emailProvider === "smtp"
      ? new SmtpEmailProvider()
      : new NoopEmailProvider();

  return { whatsapp, email };
}
