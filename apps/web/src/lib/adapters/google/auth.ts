import fs from "fs";
import { google } from "googleapis";

export function getGoogleJwt(scopes: string[]) {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!keyPath) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");

  const credentials = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

  return new google.auth.JWT(
    credentials.client_email,
    undefined,
    credentials.private_key,
    scopes
  );
}
