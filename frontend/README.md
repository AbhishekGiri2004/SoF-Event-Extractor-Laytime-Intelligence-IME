# Laytime Intelligence – Frontend

## Overview
React (Vite) app to upload CSV and PDF/DOC/DOCX files, preview extracted SoF events, perform manual entry, calculate laytime, save results, export to CSV/JSON, and sign in with Google.

## Setup
```
cd frontend
npm install
# Optional env
# VITE_API_BASE_URL=http://127.0.0.1:8000/api
# VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
npm run dev
```
Vite will print the local URL (e.g., http://localhost:5175).

## Google Sign‑In
- Configure `VITE_GOOGLE_CLIENT_ID` in `frontend/.env.local`.
- After setting it, restart `npm run dev`. Use the Sign In page to log in with Google.
- Without a client ID, mock email/password sign‑in works for development.

## Home Dashboard
- Left sidebar: Dashboard, Saved Laytime, Calculator, Profile, Support.
- Two upload boxes:
  - CSV: parses CSV/XLS/XLSX and extracts events
  - PDF/DOC/DOCX: simulates NLP extraction with progress
- Manual Entry: form fields + "Download CSV Template" to prepare Excel/CSV quickly.
- Events list: shows headings (Event Name / Start Time / End Time) and export buttons (CSV/JSON).
- Continue to Calculator passes data to the calculator.

## Calculator
- Add/edit events, compute laytime, and save.
- Saved Laytime lets you edit/delete; also supports bulk operations.

## Commands
```
npm run dev      # start dev server
npm run build    # build for production (outputs dist/)
npm run preview  # preview built app
```

## Tips
- If a blank screen appears, hard refresh (Ctrl+F5) and check the browser console.
- If port 5173 is busy, Vite will use 5174/5175; open the printed URL.

