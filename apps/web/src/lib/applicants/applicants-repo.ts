import "server-only";

import bcrypt from "bcryptjs";
import { appendRow, getAllRows, nowIso, updateRowById } from "@/lib/google/sheets";

export type ApplicantRecord = {
  applicant_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  email: string;
  password_hash: string;
  status: string; // DRAFT | PENDING_APPROVAL | APPROVED | REJECTED | PROMOTED
  kyc_status: string; // INCOMPLETE | SUBMITTED
  preferred_apartment_type: string;
  preferred_area: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createApplicant(input: {
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);

  const { rows } = await getAllRows("applicants").catch(() => ({
    rows: [] as Record<string, string>[]
  }));

  const exists = rows.some((r) => normalizeEmail(r["email"] || "") === email);
  if (exists) throw new Error("EMAIL_ALREADY_EXISTS");

  const applicantId = genId("applicant");
  const hash = bcrypt.hashSync(input.password, 12);
  const now = nowIso();

  await appendRow("applicants", [
    applicantId,
    input.firstName.trim(),
    (input.middleName || "").trim(),
    input.lastName.trim(),
    input.phone.trim(),
    email,
    hash,
    "DRAFT",
    "INCOMPLETE",
    "", // preferred_apartment_type
    "", // preferred_area
    "", // submitted_at
    now,
    now
  ]);

  return { applicantId, email };
}

export async function authenticateApplicant(emailRaw: string, password: string) {
  const email = normalizeEmail(emailRaw);

  const { rows } = await getAllRows("applicants");
  const row = rows.find((r) => normalizeEmail(r["email"] || "") === email);

  if (!row) return null;
  if ((row["status"] || "").toUpperCase() === "REJECTED") return null;

  const ok = bcrypt.compareSync(password, row["password_hash"] || "");
  if (!ok) return null;

  return {
    applicantId: row["applicant_id"],
    email,
    status: row["status"] || "DRAFT",
    kycStatus: row["kyc_status"] || "INCOMPLETE",
    firstName: row["first_name"] || "",
    lastName: row["last_name"] || ""
  };
}

export async function submitKyc(applicantId: string, patch: { preferredApartmentType: string; preferredArea: string }) {
  const now = nowIso();
  await updateRowById("applicants", "applicant_id", applicantId, {
    preferred_apartment_type: patch.preferredApartmentType.trim(),
    preferred_area: patch.preferredArea.trim(),
    kyc_status: "SUBMITTED",
    status: "PENDING_APPROVAL",
    submitted_at: now,
    updated_at: now
  });
}

export async function getApplicantById(applicantId: string) {
  const { rows } = await getAllRows("applicants");
  const row = rows.find((r) => (r["applicant_id"] || "") === applicantId);
  return row || null;
}
