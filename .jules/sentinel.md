## 2025-05-15 - Unprotected Blockchain and ML API Endpoints
**Vulnerability:** API endpoints `/api/blockchain/explore`, `/api/ml/extract`, and `/api/blockchain/claim/[id]` were missing authentication and authorization checks, allowing unauthenticated access and IDOR.
**Learning:** In projects with multiple layers (Blockchain simulation, ML simulation), it's easy to overlook security for "supporting" or "simulation" APIs.
**Prevention:** Always apply the standard `verifyAuth` pattern to every new API route by default, and implement role-based access control (RBAC) and ownership checks (IDOR protection) for all resource-specific endpoints.
