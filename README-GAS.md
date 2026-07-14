# README-GAS.md

This document explains how to deploy the Google Apps Script backend included in gas/Code.gs.

1. Create a new Google Spreadsheet and note the spreadsheet ID (the long id in the URL).
2. Open https://script.google.com/, create a new project, and paste the contents of gas/Code.gs into Code.gs.
3. Set SPREADSHEET_ID to your spreadsheet id in the script.
4. Save, then from the menu: Deploy > New deployment > Select "Web app".
   - Execute as: Me
   - Who has access: Anyone (or Anyone with link)
5. Deploy and copy the Web App URL. Replace BASE in src/api/gasClient.js with that URL.

Notes & security:
- This simple deployment exposes endpoints without auth. Consider adding a simple API key check (shared secret) for write operations.
- The sheet name used is `players`. The script will create it and header row if missing.

Deployment checklist:
- [ ] Set SPREADSHEET_ID
- [ ] Deploy Web App and copy URL
- [ ] Update frontend BASE
- [ ] Test getPlayer/savePlayer/getRank endpoints
