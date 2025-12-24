import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionUser =
  | { role: "admin"; email: string }
  | { role: "tenant"; tenantId: string };

export type AppSession = {
  user?: SessionUser;
};

const sessionOptions = {
  cookieName: "my-house-records-session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production"
  }
};

export async function getSession() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET not set");
  }
  return getIronSession<AppSession>(cookies(), sessionOptions);
}
