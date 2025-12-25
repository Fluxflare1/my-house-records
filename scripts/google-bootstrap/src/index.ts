import { loadEnv } from "./utils/env";
import { bootstrapGoogle } from "./bootstrap";

async function main() {
  loadEnv();

  const root = process.env.ROOT_FOLDER_NAME?.trim();
  const spreadsheet = process.env.SPREADSHEET_NAME?.trim();

  if (!root || !spreadsheet) {
    throw new Error("Missing ROOT_FOLDER_NAME or SPREADSHEET_NAME. Create scripts/google-bootstrap/.env with those values.");
  }

  await bootstrapGoogle({ rootFolderName: root, spreadsheetName: spreadsheet });
}

main().catch((err: any) => {
  // Print useful error details even when Node throws weird objects
  console.error("\nBootstrap failed.\n");

  if (err instanceof Error) {
    console.error(err.stack || err.message);
  } else {
    try {
      console.error("Non-Error thrown:", JSON.stringify(err, null, 2));
    } catch {
      console.error("Non-Error thrown (unserializable):", err);
    }
  }

  process.exit(1);
});
