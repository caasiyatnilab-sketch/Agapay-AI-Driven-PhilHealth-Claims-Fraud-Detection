## 2025-05-14 - [Insecure API Endpoints and Information Leakage]
**Vulnerability:** Several API endpoints (`/api/blockchain/explore`, `/api/ml/extract`, `/api/blockchain/claim/[id]`) were missing authentication and authorization checks (IDOR). Additionally, the login endpoint was leaking raw error messages.
**Learning:** In projects with multiple integrations (Blockchain, ML), it's common for developer-facing or "internal" proxy endpoints to be left unprotected.
**Prevention:** Always apply `verifyAuth` and role/ownership checks to ALL API routes by default. Use generic error messages in authentication flows.
