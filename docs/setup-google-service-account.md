# Google Service Account Setup

1. Go to Google Cloud Console
2. Create a new project
3. Enable:
   - Google Drive API
   - Google Sheets API
4. Create a Service Account
5. Generate a JSON key and download it
6. Place the file inside `scripts/google-bootstrap/`
7. Update `.env`:
   GOOGLE_SERVICE_ACCOUNT_JSON=./service-account.json
8. Run:
   npm install
   npm run bootstrap
