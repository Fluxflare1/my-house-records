import "server-only";
import { google } from "googleapis";
import { getGoogleJwt } from "./auth";

export class GoogleSheetsAdapter {
  private sheets;
  private spreadsheetId: string;
  private map: Record<string, string>;

  constructor(spreadsheetId: string, sheetMap: Record<string, string>) {
    const auth = getGoogleJwt(["https://www.googleapis.com/auth/spreadsheets"]);
    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = spreadsheetId;
    this.map = sheetMap;
  }

  private sheetName(logical: string) {
    const name = this.map[logical];
    if (!name) throw new Error(`Sheet mapping missing for ${logical}`);
    return name;
  }

  async appendRow(logical: string, values: any[]) {
    const sheet = this.sheetName(logical);
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${sheet}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [values] }
    });
  }

  async getAll(logical: string): Promise<Record<string, any>[]> {
    const sheet = this.sheetName(logical);
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheet}!A1:Z`
    });

    const rows = res.data.values || [];
    if (rows.length < 2) return [];

    const headers = rows[0];
    return rows.slice(1).map((row) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => (obj[String(h)] = row[i] ?? null));
      return obj;
    });
  }

  async updateRow(
    logical: string,
    matchKey: string,
    matchValue: string,
    updates: Record<string, any>
  ) {
    const sheet = this.sheetName(logical);

    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheet}!A1:Z`
    });

    const rows = res.data.values || [];
    if (rows.length === 0) throw new Error("Sheet is empty");

    const headers = rows[0].map(String);
    const keyIndex = headers.indexOf(matchKey);
    if (keyIndex === -1) throw new Error(`Column ${matchKey} not found`);

    const rowIndex = rows.findIndex(
      (r, i) => i > 0 && String(r[keyIndex] ?? "") === String(matchValue)
    );
    if (rowIndex === -1) throw new Error(`Row not found for ${matchValue}`);

    const current = rows[rowIndex] || [];
    const updated = headers.map((h, i) =>
      updates[h] !== undefined ? String(updates[h]) : String(current[i] ?? "")
    );

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheet}!A${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [updated] }
    });
  }
}
