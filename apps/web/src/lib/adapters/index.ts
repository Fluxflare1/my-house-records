import { loadConfig } from "../config/registry";
import { GoogleSheetsAdapter } from "./google/sheets.adapter";
import { GoogleDriveAdapter } from "./google/drive.adapter";

export function getAdapters() {
  const config = loadConfig();

  if (config.backend === "google") {
    if (!config.google) {
      throw new Error("Google backend selected but config missing");
    }

    return {
      sheets: new GoogleSheetsAdapter(config.google.sheets),
      drive: new GoogleDriveAdapter(config.google.drive)
    };
  }

  throw new Error("Postgres backend not implemented yet");
}
