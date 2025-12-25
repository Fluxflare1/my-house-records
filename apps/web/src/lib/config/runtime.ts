import "server-only";
import fs from "fs";
import path from "path";

type RuntimeConfig = {
  backend: "google";
  google: {
    sheets: {
      spreadsheetId: string;
      sheets: Record<string, string>;
    };
    drive?: {
      rootFolderId?: string;
      folders?: Record<string, string>;
    };
  };
};

let cached: RuntimeConfig | null = null;

export function getRuntimeConfig(): RuntimeConfig {
  if (cached) return cached;

  const p = process.env.APP_CONFIG_PATH || "./config/runtime-config.json";
  const resolved = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);

  if (!fs.existsSync(resolved)) {
    throw new Error(`APP_CONFIG_PATH not found: ${resolved}`);
  }

  const raw = fs.readFileSync(resolved, "utf-8");
  const cfg = JSON.parse(raw) as RuntimeConfig;

  if (!cfg?.google?.sheets?.spreadsheetId) {
    throw new Error("runtime-config.json missing google.sheets.spreadsheetId");
  }

  cached = cfg;
  return cfg;
}
