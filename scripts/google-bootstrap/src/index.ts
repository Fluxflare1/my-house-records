import { getGoogleClients } from "./google.js";
import { SHEETS } from "./schema.js";

const ROOT_FOLDER_NAME = process.env.ROOT_FOLDER_NAME;
const SPREADSHEET_NAME = process.env.SPREADSHEET_NAME;

if (!ROOT_FOLDER_NAME || !SPREADSHEET_NAME) {
  throw new Error("Missing ROOT_FOLDER_NAME or SPREADSHEET_NAME");
}

async function ensureSheetTabAndHeaders(params: {
  sheetsApi: any;
  spreadsheetId: string;
  title: string;
  headers: string[];
}) {
  const { sheetsApi, spreadsheetId, title, headers } = params;

  const meta = await sheetsApi.spreadsheets.get({ spreadsheetId });
  const sheet = (meta.data.sheets || []).find((s: any) => s.properties?.title === title);

  // 1) Create sheet tab if missing
  if (!sheet) {
    await sheetsApi.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }]
      }
    });
  }

  // 2) Check if header row exists; if not, write headers
  const read = await sheetsApi.spreadsheets.values.get({
    spreadsheetId,
    range: `${title}!A1:ZZ1`
  });

  const row1 = (read.data.values && read.data.values[0]) ? read.data.values[0] : [];
  const hasAnyHeader = row1.some((x: any) => String(x || "").trim().length > 0);

  if (!hasAnyHeader) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId,
      range: `${title}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] }
    });
  }
}

async function main() {
  const { drive, sheetsApi } = await getGoogleClients();

  // Create/find Drive root folder
  const rootFolderId = await drive.ensureFolder(ROOT_FOLDER_NAME);

  // Create/find Spreadsheet in that folder
  const spreadsheetId = await drive.ensureSpreadsheetInFolder(SPREADSHEET_NAME, rootFolderId);

  // Ensure all sheet tabs exist + headers written
  for (const def of SHEETS) {
    await ensureSheetTabAndHeaders({
      sheetsApi,
      spreadsheetId,
      title: def.name,
      headers: def.headers
    });
  }

  // Create Drive subfolders (optional if your script already does this elsewhere)
  const receipts = await drive.ensureFolder("receipts", rootFolderId);
  const statements = await drive.ensureFolder("statements", rootFolderId);
  const agreements = await drive.ensureFolder("agreements", rootFolderId);
  const exportsF = await drive.ensureFolder("exports", rootFolderId);

  // Print output values to copy into runtime-config.json
  console.log("\nBOOTSTRAP COMPLETE ✅");
  console.log("SPREADSHEET_ID=", spreadsheetId);
  console.log("ROOT_FOLDER_ID=", rootFolderId);
  console.log("FOLDERS=", { receipts, statements, agreements, exports: exportsF });
}

main().catch((e) => {
  console.error("Bootstrap failed:", e);
  process.exit(1);
});
