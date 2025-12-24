import "server-only";
import { loadConfig } from "../config/registry";
import { GoogleSheetsAdapter } from "./google/sheets.adapter";
import { GoogleDriveAdapter } from "./google/drive.adapter";

export function getAdapters() {
  const cfg = loadConfig();

  const sheets = new GoogleSheetsAdapter(
    cfg.google.sheets.spreadsheetId,
    {
      properties: cfg.google.sheets.sheets.properties,
      apartmentTypes: cfg.google.sheets.sheets.apartmentTypes,
      apartments: cfg.google.sheets.sheets.apartments,
      tenants: cfg.google.sheets.sheets.tenants,
      occupancies: cfg.google.sheets.sheets.occupancies,
      rents: cfg.google.sheets.sheets.rents,
      bills: cfg.google.sheets.sheets.bills,
      payments: cfg.google.sheets.sheets.payments,
      allocations: cfg.google.sheets.sheets.allocations,
      documents: cfg.google.sheets.sheets.documents
    }
  );

  const drive = new GoogleDriveAdapter({
    receipts: cfg.google.drive.folders.receipts,
    statements: cfg.google.drive.folders.statements,
    agreements: cfg.google.drive.folders.agreements,
    exports: cfg.google.drive.folders.exports
  });

  return { sheets, drive };
}
