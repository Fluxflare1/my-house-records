import "server-only";
import { verifyPassword } from "./password";

export async function verifyAdminLogin(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash) {
    throw new Error("Admin credentials not configured");
  }

  if (email !== adminEmail) return false;

  return verifyPassword(password, adminHash);
}
