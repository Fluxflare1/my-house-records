import "server-only";
import { NotificationResult, WhatsAppPort } from "../ports";

/**
 * Direct/official WhatsApp sending via Meta WhatsApp Business Cloud API.
 * Requires:
 * - WHATSAPP_PROVIDER=meta
 * - META_WA_PHONE_NUMBER_ID
 * - META_WA_ACCESS_TOKEN
 * - META_WA_TEMPLATE_NAME (optional; if not provided we send "text" message)
 *
 * Note: Cloud API supports templated messages for business-initiated messaging.
 * For simplicity, we attempt a plain "text" send. If your account requires templates,
 * switch to template flow later (still via Meta, still direct).
 */
export class MetaWhatsAppProvider implements WhatsAppPort {
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    const pid = process.env.META_WA_PHONE_NUMBER_ID;
    const token = process.env.META_WA_ACCESS_TOKEN;
    if (!pid || !token) throw new Error("Meta WhatsApp config missing");
    this.phoneNumberId = pid;
    this.accessToken = token;
  }

  async sendWhatsApp(params: { toE164: string; text: string }): Promise<NotificationResult> {
    try {
      const url = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: params.toE164,
          type: "text",
          text: { body: params.text }
        })
      });

      if (!res.ok) {
        const body = await res.text();
        return { ok: false, error: `Meta WhatsApp send failed: ${res.status} ${body}` };
      }

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Meta WhatsApp send failed" };
    }
  }
}
