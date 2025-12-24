import { google } from "googleapis";
import fs from "fs";

interface DriveConfig {
  rootFolderId: string;
  folders: Record<string, string>;
}

export class GoogleDriveAdapter {
  private drive;
  private folders;

  constructor(config: DriveConfig) {
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!keyPath) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
    }

    const credentials = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ["https://www.googleapis.com/auth/drive"]
    );

    this.drive = google.drive({ version: "v3", auth });
    this.folders = config.folders;
  }

  async uploadFile(
    logicalFolder: string,
    filename: string,
    mimeType: string,
    buffer: Buffer
  ): Promise<string> {
    const folderId = this.folders[logicalFolder];
    if (!folderId) {
      throw new Error(`Drive folder not mapped: ${logicalFolder}`);
    }

    const res = await this.drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId]
      },
      media: {
        mimeType,
        body: buffer
      }
    });

    return res.data.id!;
  }
}
