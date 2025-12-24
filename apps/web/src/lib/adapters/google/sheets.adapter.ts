import { google } from "googleapis";
import fs from "fs";

interface SheetsConfig {
  spreadsheetId: string;
  sheets: Record<string, string>;
}

export class GoogleSheetsAdapter {
  private sheets;
  private spreadsheetId;
  private sheetMap;

  constructor(config: SheetsConfig) {
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!keyPath) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
    }

    const credentials = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = config.spreadsheetId;
    this.sheetMap = config.sheets;
  }

  async appendRow(logicalTable: string, values: any[]) {
    const sheetName = this.sheetMap[logicalTable];
    if (!sheetName) {
      throw new Error(`Sheet mapping not found for ${logicalTable}`);
    }

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [values] }
    });
  }
}
