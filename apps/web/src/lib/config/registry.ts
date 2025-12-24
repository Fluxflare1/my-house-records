import fs from "fs";
import path from "path";
import { AppConfig } from "./schema";

const CONFIG_PATH =
  process.env.APP_CONFIG_PATH ||
  path.resolve(process.cwd(), "config/runtime-config.json");

let cached: AppConfig | null = null;

function mustString(v: unknown, name: string): string {
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`Invalid config: ${name} is required`);
  }
  return v;
}

export function loadConfig(): AppConfig {
  if (cached) return cached;

  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found at ${CONFIG_PATH}`);
  }

  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Partial<AppConfig>;

  if (parsed.backend !== "google") {
    throw new Error(`Invalid config: backend must be "google" for now`);
  }
  if (!parsed.google) throw new Error("Invalid config: google missing");

  // Minimal validation (production safe)
  mustString(parsed.google.sheets?.spreadsheetId, "google.sheets.spreadsheetId");
  mustString(parsed.google.drive?.rootFolderId, "google.drive.rootFolderId");

  cached = parsed as AppConfig;
  return cached;
}
