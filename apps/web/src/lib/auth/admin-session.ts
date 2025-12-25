import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "mhr_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

type AdminSessionPayload = {
  adminUserId: string;
  email: string;
  fullName: string;
  permissions: string[]; // e.g. ["manage_bills", "view_statements"]
  iat: number;
  exp: number;
};

function getSecret() {
  const s = process.env.APP_SESSION_SECRET || "";
  if (!s || s.length < 16) {
    throw new Error("Missing APP_SESSION_SECRET (min 16 chars). Set it in your hosting env.");
  }
  return s;
}

function b64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlToBuf(s: string) {
  const pad = 4 - (s.length % 4 || 4);
  const base64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64");
}

function sign(data: string) {
  const h = crypto.createHmac("sha256", getSecret());
  h.update(data);
  return b64url(h.digest());
}

export function createAdminSessionToken(payload: Omit<AdminSessionPayload, "iat" | "exp">) {
  const now = Math.floor(Date.now() / 1000);
  const full: AdminSessionPayload = {
    ...payload,
    iat: now,
    exp: now + MAX_AGE_SECONDS
  };

  const json = JSON.stringify(full);
  const encoded = b64url(Buffer.from(json, "utf8"));
  const sig = sign(encoded);
  return `${encoded}.${sig}`;
}

export function readAdminSessionToken(token: string): AdminSessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encoded, sig] = parts;
  const expected = sign(encoded);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  try {
    const payload = JSON.parse(b64urlToBuf(encoded).toString("utf8")) as AdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS
  });
}

export function clearAdminSessionCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function getAdminSession(): AdminSessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value || "";
  if (!token) return null;
  return readAdminSessionToken(token);
}

export function hasPermission(session: AdminSessionPayload, perm: string) {
  // super-admin wildcard
  if (session.permissions.includes("*")) return true;
  return session.permissions.includes(perm);
}
