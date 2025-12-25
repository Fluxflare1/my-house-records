import "server-only";

import { getRuntimeConfig } from "@/lib/config/runtime";
import { getGoogleSheetsClient } from "@/lib/google/google-clients";

export function sheetName(logicalName: string) {
  const cfg = getRuntimeConfig();
  const name = cfg.google.sheets.sheets[logicalName];
  if (!name) {
    throw new Error(`runtime-config missing sheet mapping for: ${logicalName}`);
  }
  return name;
}

export async function appendRow(logicalSheet: string, row: (string | number | boolean | null)[]) {
  const cfg = getRuntimeConfig();
  const { sheets } = getGoogleSheetsClient();

  const tab = sheetName(logicalSheet);

  await sheets.spreadsheets.values.append({
    spreadsheetId: cfg.google.sheets.spreadsheetId,
    range: `${tab}!A:Z`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] }
  });
}

export async function getAllRows(logicalSheet: string) {
  const cfg = getRuntimeConfig();
  const { sheets } = getGoogleSheetsClient();
  const tab = sheetName(logicalSheet);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: cfg.google.sheets.spreadsheetId,
    range: `${tab}!A:Z`
  });

  const values: string[][] = res.data.values || [];
  if (values.length === 0) return { headers: [], rows: [] as Record<string, string>[] };

  const headers = values[0];
  const rows = values.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = r[i] ?? ""));
    return obj;
  });

  return { headers, rows };
}

export async function updateRowById(
  logicalSheet: string,
  idField: string,
  idValue: string,
  patch: Record<string, string>
) {
  const cfg = getRuntimeConfig();
  const { sheets } = getGoogleSheetsClient();
  const tab = sheetName(logicalSheet);

  const { headers, rows } = await getAllRows(logicalSheet);
  if (!headers.length) throw new Error(`Sheet "${tab}" is empty or missing headers`);

  const idx = rows.findIndex((r) => (r[idField] || "").trim() === idValue.trim());
  if (idx === -1) throw new Error(`Row not found in "${tab}" where ${idField}=${idValue}`);

  const rowNumber = idx + 2; // + header row
  const existing = rows[idx];

  const next: string[] = headers.map((h) => (patch[h] !== undefined ? patch[h] : existing[h] ?? ""));

  await sheets.spreadsheets.values.update({
    spreadsheetId: cfg.google.sheets.spreadsheetId,
    range: `${tab}!A${rowNumber}:Z${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [next] }
  });
}

export function nowIso() {
  return new Date().toISOString();
}
