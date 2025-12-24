import { SmtpEmailProvider } from "./email.smtp";
import { TwilioWhatsAppProvider } from "./whatsapp.twilio";

export class NotificationService {
  private emailEnabled = process.env.NOTIFY_EMAIL === "true";
  private whatsappEnabled = process.env.NOTIFY_WHATSAPP === "true";

  async notifyEmail(to: string, subject: string, text: string) {
    if (!this.emailEnabled) return;
    const provider = new SmtpEmailProvider();
    await provider.send({ to, subject, text });
  }

  async notifyWhatsApp(toE164: string, text: string) {
    if (!this.whatsappEnabled) return;
    const provider = new TwilioWhatsAppProvider();
    await provider.send({ toE164, text });
  }
}
