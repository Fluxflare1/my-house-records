import "server-only";
import crypto from "crypto";

const PBKDF2_ITERS = 120000;
const KEYLEN = 32;
const DIGEST = "sha256";

export function hashPassword(plain: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(plain, salt, PBKDF2_ITERS, KEYLEN, DIGEST).toString("hex");
  return `pbkdf2$${PBKDF2_ITERS}$${salt}$${hash}`;
}

export function verifyPassword(plain: string, stored: string) {
  try {
    const parts = stored.split("$");
    if (parts.length !== 4) return false;
    const [, itersStr, salt, hash] = parts;
    const iters = Number(itersStr);
    if (!Number.isFinite(iters) || iters <= 0) return false;

    const derived = crypto.pbkdf2Sync(plain, salt, iters, KEYLEN, DIGEST).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(derived));
  } catch {
    return false;
  }
}
