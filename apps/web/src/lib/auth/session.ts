import "server-only";

import { cookies } from "next/headers";
import { getIronSession, IronSession } from "iron-session";

function requirePassword() {
  const pw = process.env.SESSION_PASSWORD;
  if (!pw || pw.length < 32) {
    throw new Error("SESSION_PASSWORD missing or too short. Set it in apps/web/.env.local (>= 32 chars).");
  }
  return pw;
}

export type ApplicantSessionData = {
  applicant?: {
    applicantId: string;
    email: string;
    status: string;
    kycStatus: string;
  };
};

const applicantSessionOptions = {
  cookieName: "mhr_applicant_session",
  password: requirePassword(),
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/"
  }
};

export async function getApplicantSession(): Promise<IronSession<ApplicantSessionData>> {
  // cookies() is available in server context
  return getIronSession<ApplicantSessionData>(cookies(), applicantSessionOptions);
}
