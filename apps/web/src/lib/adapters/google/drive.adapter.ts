import "server-only";
import { google } from "googleapis";
import { Readable } from "stream";
import { getGoogleJwt } from "./auth";

export class GoogleDriveAdapter {
  private drive;
  private folders: Record<string, string>;

  constructor(folders: Record<string, string>) {
    const auth = getGoogleJwt(["https://www.googleapis.com/auth/drive"]);
    this.drive = google.drive({ version: "v3", auth });
    this.folders = folders;
  }

  private folderId(logical: string) {
    const id = this.folders[logical];
    if (!id) throw new Error(`Drive folder mapping missing for ${logical}`);
    return id;
  }

  async uploadBuffer(
    logicalFolder: string,
    filename: string,
    mimeType: string,
    buffer: Buffer
  ): Promise<{ fileId: string; webViewLink?: string }> {
    const folderId = this.folderId(logicalFolder);

    const res = await this.drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId]
      },
      media: {
        mimeType,
        body: Readable.from(buffer)
      },
      fields: "id, webViewLink"
    });

    return { fileId: String(res.data.id), webViewLink: res.data.webViewLink || undefined };
  }
}
