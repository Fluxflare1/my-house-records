export type NotificationResult = { ok: true } | { ok: false; error: string };

export interface WhatsAppPort {
  sendWhatsApp(params: { toE164: string; text: string }): Promise<NotificationResult>;
}

export interface EmailPort {
  sendEmail(params: { toEmail: string; subject: string; text: string }): Promise<NotificationResult>;
}
