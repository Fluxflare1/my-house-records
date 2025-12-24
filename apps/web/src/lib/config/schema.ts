export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheets: {
    properties: string;
    apartmentTypes: string;
    apartments: string;
    tenants: string;
    occupancies: string;
    rents: string;
    bills: string;
    payments: string;
    allocations: string;
    documents: string;
  };
}

export interface GoogleDriveConfig {
  rootFolderId: string;
  folders: {
    receipts: string;
    statements: string;
    agreements: string;
    exports: string;
  };
}

export interface AppConfig {
  backend: "google";
  google: {
    sheets: GoogleSheetsConfig;
    drive: GoogleDriveConfig;
  };
}
