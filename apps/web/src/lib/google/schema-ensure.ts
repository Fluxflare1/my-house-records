import "server-only";

import { getRuntimeConfig } from "@/lib/config/runtime";
import { getGoogleSheetsClient } from "@/lib/google/google-clients";
import { sheetName } from "@/lib/google/sheets";

type EnsureSpec = {
  logicalSheet: string;
  requiredHeaders: string[];
};

async function getSheetIdByTitle(spreadsheetId: string, title: string) {
  const { sheets } = getGoogleSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const found = (meta.data.sheets || []).find((s: any) => s.properties?.title === title);
  return found?.properties?.sheetId as number | undefined;
}

async function addSheet(spreadsheetId: string, title: string) {
  const { sheets } = getGoogleSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title } } }]
    }
  });
}

export async function ensureSheetAndHeaders(spec: EnsureSpec) {
  const cfg = getRuntimeConfig();
  const spreadsheetId = cfg.google.sheets.spreadsheetId;

  const title = sheetName(spec.logicalSheet);

  // 1) ensure tab exists
  let sheetId = await getSheetIdByTitle(spreadsheetId, title);
  if (!sheetId) {
    await addSheet(spreadsheetId, title);
    sheetId = await getSheetIdByTitle(spreadsheetId, title);
    if (!sheetId) throw new Error(`FAILED_TO_CREATE_SHEET:${title}`);
  }

  // 2) read existing headers
  const { sheets } = getGoogleSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${title}!1:1`
  });

  const existing = (res.data.values?.[0] || []).map((x: any) => String(x || "").trim());
  const set = new Set(existing.filter(Boolean));

  const missing = spec.requiredHeaders.filter((h) => !set.has(h));
  if (missing.length === 0) {
    return { ok: true, sheet: title, created: false, updatedHeaders: false, missing: [] as string[] };
  }

  const nextHeaders = existing.length ? existing : [];
  for (const h of missing) nextHeaders.push(h);

  // Update row 1 with new headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${title}!A1:${String.fromCharCode(65 + Math.max(0, nextHeaders.length - 1))}1`,
    valueInputOption: "RAW",
    requestBody: { values: [nextHeaders] }
  });

  return { ok: true, sheet: title, created: false, updatedHeaders: true, missing };
}
