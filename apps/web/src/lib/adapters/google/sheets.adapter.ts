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



// ADD BELOW existing code in this file

  async getAll(logicalTable: string): Promise<any[]> {
    const sheetName = this.sheetMap[logicalTable];
    if (!sheetName) throw new Error(`Sheet mapping not found for ${logicalTable}`);

    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A1:Z`
    });

    const rows = res.data.values || [];
    if (rows.length < 2) return [];

    const headers = rows[0];
    return rows.slice(1).map(row =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] ?? null]))
    );
  }

  async updateRow(
    logicalTable: string,
    matchKey: string,
    matchValue: string,
    updates: Record<string, any>
  ) {
    const sheetName = this.sheetMap[logicalTable];
    if (!sheetName) throw new Error(`Sheet mapping not found for ${logicalTable}`);

    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A1:Z`
    });

    const rows = res.data.values || [];
    const headers = rows[0];
    const keyIndex = headers.indexOf(matchKey);
    if (keyIndex === -1) throw new Error(`Key ${matchKey} not found`);

    const rowIndex = rows.findIndex((r, i) => i > 0 && r[keyIndex] === matchValue);
    if (rowIndex === -1) throw new Error(`Row not found`);

    const updatedRow = headers.map(h => updates[h] ?? rows[rowIndex][headers.indexOf(h)] ?? "");

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [updatedRow] }
    });
  }
