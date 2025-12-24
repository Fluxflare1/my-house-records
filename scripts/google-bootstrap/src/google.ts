import { google } from "googleapis";
import fs from "fs";

export function getGoogleClients() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!keyPath) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  }

  const credentials = JSON.parse(fs.readFileSync(keyPath, "utf8"));

  const auth = new google.auth.JWT(
    credentials.client_email,
    undefined,
    credentials.private_key,
    [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets"
    ]
  );

  return {
    drive: google.drive({ version: "v3", auth }),
    sheets: google.sheets({ version: "v4", auth })
  };
}
