import "server-only";
import { getSession } from "./session";

export async function requireAdmin() {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    throw new Error("Unauthorized: admin only");
  }
  return session.user;
}

export async function requireTenant() {
  const session = await getSession();
  if (!session.user || session.user.role !== "tenant") {
    throw new Error("Unauthorized: tenant only");
  }
  return session.user;
}
