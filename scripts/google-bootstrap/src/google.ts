import fs from "fs";
import path from "path";
import { google } from "googleapis";

export function getGoogleClients() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "./service-account.json";
  const resolved = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Service account JSON not found at: ${resolved}`);
  }

  const key = JSON.parse(fs.readFileSync(resolved, "utf-8"));

  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets"
    ]
  });

  return {
    drive: google.drive({ version: "v3", auth }),
    sheets: google.sheets({ version: "v4", auth })
  };
}
