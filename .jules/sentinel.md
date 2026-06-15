## 2025-06-15 - [CSV Injection Prevention]
**Vulnerability:** The `csvEscape` function in `lib/claimRules.js` only handled quotes and commas, leaving the application vulnerable to formula injection when malicious strings starting with `=`, `+`, `-`, or `@` were exported to CSV.
**Learning:** Generic CSV escaping is insufficient for security if the CSV is intended to be opened in spreadsheet software like Excel or Google Sheets.
**Prevention:** Always prepend a single quote `'` to any value that starts with formula-triggering characters (`=`, `+`, `-`, `@`, `\t`, `\r`) during CSV generation.

## 2025-06-15 - [Missing Authentication on Publicly Accessible Data]
**Vulnerability:** The `/api/hospitals` endpoint was accessible without authentication, exposing the list of healthcare providers and their metadata.
**Learning:** Standardizing authentication checks (e.g., using `verifyAuth`) across all API routes is critical to prevent unintended data exposure.
**Prevention:** Apply `verifyAuth(req)` by default to all new API endpoints and only omit it for explicitly public routes like `/api/auth/login`.
