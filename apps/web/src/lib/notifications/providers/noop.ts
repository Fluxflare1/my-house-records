import { EmailPort, NotificationResult, WhatsAppPort } from "../ports";

export class NoopWhatsAppProvider implements WhatsAppPort {
  async sendWhatsApp(): Promise<NotificationResult> {
    return { ok: true };
  }
}

export class NoopEmailProvider implements EmailPort {
  async sendEmail(): Promise<NotificationResult> {
    return { ok: true };
  }
}
