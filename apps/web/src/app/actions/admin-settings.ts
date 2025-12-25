"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { getAdapters } from "@/lib/adapters";

type Row = Record<string, any>;
const SETTINGS_TABLE = "settings";

function s(v: any) {
  return String(v ?? "").trim();
}

async function safeGetAll(sheets: any, table: string): Promise<Row[]> {
  try {
    return (await sheets.getAll(table)) as Row[];
  } catch {
    return [];
  }
}

export type SettingsKV = { key: string; value: string };

export async function getAllSettings(): Promise<SettingsKV[]> {
  await requireAdmin();
  const { sheets } = getAdapters();
  const rows = await safeGetAll(sheets, SETTINGS_TABLE);

  // Expect columns: key, value
  const out: SettingsKV[] = [];
  for (const r of rows) {
    const key = s(r.key);
    if (!key) continue;
    out.push({ key, value: s(r.value) });
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

export async function upsertSettingsBulk(items: SettingsKV[]) {
  await requireAdmin();
  const { sheets } = getAdapters();

  // Read existing
  const existing = await safeGetAll(sheets, SETTINGS_TABLE);
  const existingByKey = new Map<string, Row>();
  for (const r of existing) {
    const k = s(r.key);
    if (k) existingByKey.set(k, r);
  }

  // Upsert: update if exists, else append
  for (const it of items) {
    const k = s(it.key);
    const v = s(it.value);
    if (!k) continue;

    if (existingByKey.has(k)) {
      await sheets.updateRow(SETTINGS_TABLE, "key", k, { value: v });
    } else {
      // Append expects values in sheet column order; our adapter uses Object.values(row)
      await sheets.appendRow(SETTINGS_TABLE, [k, v]);
    }
  }

  return { ok: true };
}
