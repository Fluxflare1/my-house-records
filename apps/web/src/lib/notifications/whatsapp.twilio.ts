import twilio from "twilio";

export type WhatsAppPayload = {
  toE164: string; // e.g. +234...
  text: string;
};

export class TwilioWhatsAppProvider {
  private client;
  private from;

  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    this.from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+1415...
    if (!sid || !token || !this.from) {
      throw new Error("Twilio WhatsApp config missing");
    }
    this.client = twilio(sid, token);
  }

  async send(payload: WhatsAppPayload) {
    await this.client.messages.create({
      from: this.from,
      to: `whatsapp:${payload.toE164}`,
      body: payload.text,
    });
  }
}
