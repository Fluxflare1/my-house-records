"use server";

import { requireAdminPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
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
  await requireAdminPermission(PERMS.MANAGE_SETTINGS);

  const { sheets } = getAdapters();
  const rows = await safeGetAll(sheets, SETTINGS_TABLE);

  const out: SettingsKV[] = [];
  for (const r of rows) {
    const key = s(r.key);
    if (!key) continue;
    out.push({ key, value: s(r.value) });
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

export async function upsertSettingsBulk(items: SettingsKV[]) {
  await requireAdminPermission(PERMS.MANAGE_SETTINGS);

  const { sheets } = getAdapters();

  const existing = await safeGetAll(sheets, SETTINGS_TABLE);
  const existingByKey = new Map<string, Row>();
  for (const r of existing) {
    const k = s(r.key);
    if (k) existingByKey.set(k, r);
  }

  for (const it of items) {
    const k = s(it.key);
    const v = s(it.value);
    if (!k) continue;

    if (existingByKey.has(k)) {
      await sheets.updateRow(SETTINGS_TABLE, "key", k, { value: v });
    } else {
      await sheets.appendRow(SETTINGS_TABLE, [k, v]);
    }
  }

  return { ok: true };
}
