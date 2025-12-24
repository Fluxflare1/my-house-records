import nodemailer from "nodemailer";

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
};

export class SmtpEmailProvider {
  private transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      throw new Error("SMTP config missing (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)");
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      auth: { user, pass },
      secure: port === 465,
    });
  }

  async send(payload: EmailPayload) {
    const from = process.env.SMTP_FROM;
    if (!from) throw new Error("SMTP_FROM missing");

    await this.transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    });
  }
}
