import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { getGoogleClients } from "./google";
import { DRIVE_FOLDERS, SHEETS } from "./schema";

type BootstrapResult = {
  spreadsheetId: string;
  rootFolderId: string;
  folders: Record<string, string>;
};

function loadEnv() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

function requireEnv(name: string) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name}. Create scripts/google-bootstrap/.env and set ${name}=...`);
  return v;
}

async function findOrCreateFolder(drive: any, name: string, parentId?: string) {
  // Drive "list" can fail on some accounts; but folder creation also needs permission.
  // We'll still attempt list first (fast), if list fails, fallback to create.
  try {
    const qParts = [
      `mimeType='application/vnd.google-apps.folder'`,
      `name='${name.replace(/'/g, "\\'")}'`,
      "trashed=false"
    ];
    if (parentId) qParts.push(`'${parentId}' in parents`);

    const res = await drive.files.list({
      q: qParts.join(" and "),
      fields: "files(id,name)",
      spaces: "drive"
    });

    const existing = res.data.files?.[0];
    if (existing?.id) return existing.id;
  } catch {
    // ignore and fall through to create
  }

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined
    },
    fields: "id"
  });

  if (!created.data.id) throw new Error(`Failed to create folder: ${name}`);
  return created.data.id;
}

/**
 * Safer: Create spreadsheet using Sheets API (does not require Drive file search/list),
 * then optionally move it into the given Drive folder.
 */
async function createSpreadsheetViaSheets(sheetsApi: any, title: string) {
  const created = await sheetsApi.spreadsheets.create({
    requestBody: { properties: { title } },
    fields: "spreadsheetId"
  });

  const id = created.data.spreadsheetId;
  if (!id) throw new Error("Failed to create spreadsheet via Sheets API");
  return id;
}

async function moveFileIntoFolder(drive: any, fileId: string, folderId: string) {
  // Move file into folder by updating parents
  const current = await drive.files.get({
    fileId,
    fields: "parents"
  });

  const prevParents = (current.data.parents || []).join(",");
  await drive.files.update({
    fileId,
    addParents: folderId,
    removeParents: prevParents || undefined,
    fields: "id, parents"
  });
}

async function ensureSheetsAndHeaders(sheetsApi: any, spreadsheetId: string) {
  const meta = await sheetsApi.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title))"
  });

  const existingTitles = new Set(
    (meta.data.sheets || []).map((s: any) => s.properties?.title).filter(Boolean)
  );

  const addRequests: any[] = [];
  for (const spec of SHEETS) {
    if (!existingTitles.has(spec.title)) {
      addRequests.push({ addSheet: { properties: { title: spec.title } } });
    }
  }

  if (addRequests.length > 0) {
    await sheetsApi.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: addRequests }
    });
  }

  for (const spec of SHEETS) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId,
      range: `${spec.title}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [spec.headers] }
    });
  }
}

function maybeWriteRuntimeConfig(result: BootstrapResult) {
  const appConfigPath = process.env.APP_CONFIG_PATH?.trim();
  if (!appConfigPath) return;

  const resolved = path.isAbsolute(appConfigPath)
    ? appConfigPath
    : path.resolve(process.cwd(), appConfigPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`APP_CONFIG_PATH points to missing file: ${resolved}`);
  }

  const config = JSON.parse(fs.readFileSync(resolved, "utf-8"));

  config.backend = "google";
  config.google = config.google || {};
  config.google.sheets = config.google.sheets || {};
  config.google.drive = config.google.drive || {};
  config.google.drive.folders = config.google.drive.folders || {};

  config.google.sheets.spreadsheetId = result.spreadsheetId;
  config.google.drive.rootFolderId = result.rootFolderId;

  for (const [k, v] of Object.entries(result.folders)) {
    config.google.drive.folders[k] = v;
  }

  fs.writeFileSync(resolved, JSON.stringify(config, null, 2), "utf-8");
  console.log(`\n✅ Updated runtime config at: ${resolved}`);
}

async function main() {
  loadEnv();

  const ROOT_FOLDER_NAME = requireEnv("ROOT_FOLDER_NAME");
  const SPREADSHEET_NAME = requireEnv("SPREADSHEET_NAME");

  const { drive, sheets } = getGoogleClients();

  // 1) Create / reuse root folder (Drive)
  const rootFolderId = await findOrCreateFolder(drive, ROOT_FOLDER_NAME);

  // 2) Create / reuse subfolders (Drive)
  const folders: Record<string, string> = {};
  for (const f of DRIVE_FOLDERS) {
    folders[f] = await findOrCreateFolder(drive, f, rootFolderId);
  }

  // 3) Create spreadsheet via Sheets API (safer than Drive search/list)
  const spreadsheetId = await createSpreadsheetViaSheets(sheets, SPREADSHEET_NAME);

  // 4) Attempt to move spreadsheet into root folder (Drive). If it fails, continue.
  try {
    await moveFileIntoFolder(drive, spreadsheetId, rootFolderId);
  } catch (e) {
    console.warn("\n⚠ Could not move spreadsheet into the Drive folder. This is OK.");
    console.warn("   Spreadsheet was still created successfully.");
  }

  // 5) Ensure tabs + headers
  await ensureSheetsAndHeaders(sheets, spreadsheetId);

  const result: BootstrapResult = { spreadsheetId, rootFolderId, folders };

  console.log("\n✅ Bootstrap complete.");
  console.log("\n--- Copy these into apps/web/config/runtime-config.json ---");
  console.log(JSON.stringify(result, null, 2));

  maybeWriteRuntimeConfig(result);
}

main().catch((err: any) => {
  console.error("\n❌ Bootstrap failed.");
  if (err instanceof Error) console.error(err.stack || err.message);
  else console.error(err);
  process.exit(1);
});
