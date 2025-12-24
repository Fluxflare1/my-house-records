import "dotenv/config";
import { getGoogleClients } from "./google.js";
import { SHEET_SCHEMAS } from "./schema.js";

const ROOT_FOLDER_NAME = process.env.ROOT_FOLDER_NAME!;
const SPREADSHEET_NAME = process.env.SPREADSHEET_NAME!;

if (!ROOT_FOLDER_NAME || !SPREADSHEET_NAME) {
  throw new Error("Missing ROOT_FOLDER_NAME or SPREADSHEET_NAME");
}

async function main() {
  const { drive, sheets } = getGoogleClients();

  // 1. Create root Drive folder
  const rootFolder = await drive.files.create({
    requestBody: {
      name: ROOT_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder"
    }
  });

  const rootFolderId = rootFolder.data.id!;
  console.log("Root folder created:", rootFolderId);

  // 2. Subfolders
  const subfolders = ["receipts", "statements", "agreements", "exports"];
  for (const name of subfolders) {
    await drive.files.create({
      requestBody: {
        name,
        parents: [rootFolderId],
        mimeType: "application/vnd.google-apps.folder"
      }
    });
  }

  // 3. Create Spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: SPREADSHEET_NAME },
      sheets: Object.keys(SHEET_SCHEMAS).map(name => ({
        properties: { title: name }
      }))
    }
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId!;
  console.log("Spreadsheet created:", spreadsheetId);

  // 4. Populate headers
  for (const [sheetName, headers] of Object.entries(SHEET_SCHEMAS)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers]
      }
    });
  }

  console.log("Bootstrap completed successfully");
  console.log("Drive Folder ID:", rootFolderId);
  console.log("Spreadsheet ID:", spreadsheetId);
}

main().catch(err => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});
