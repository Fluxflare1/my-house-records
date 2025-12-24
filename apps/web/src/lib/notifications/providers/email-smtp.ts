import "server-only";
import nodemailer from "nodemailer";
import { EmailPort, NotificationResult } from "../ports";

export class SmtpEmailProvider implements EmailPort {
  private transporter;
  private from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM;

    if (!host || !port || !user || !pass || !from) {
      throw new Error("SMTP config missing (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)");
    }

    this.from = from;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  async sendEmail(params: { toEmail: string; subject: string; text: string }): Promise<NotificationResult> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: params.toEmail,
        subject: params.subject,
        text: params.text
      });
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "SMTP send failed" };
    }
  }
}
