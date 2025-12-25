import "server-only";

import fs from "fs";
import path from "path";
import { google } from "googleapis";

let cached: { sheets: any } | null = null;

export function getGoogleSheetsClient() {
  if (cached) return cached;

  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "./service-account.json";
  const resolved = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Service account JSON not found at: ${resolved}`);
  }

  const key = JSON.parse(fs.readFileSync(resolved, "utf-8"));

  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  cached = {
    sheets: google.sheets({ version: "v4", auth })
  };

  return cached;
}
