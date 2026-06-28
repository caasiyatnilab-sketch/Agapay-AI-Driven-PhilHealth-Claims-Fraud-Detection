## 2025-05-15 - Hardened Authentication & API Authorization
**Vulnerability:** Hardcoded JWT secret fallback and unprotected API endpoints.
**Learning:** Using a fallback secret like 'fallback-secret' allows bypass if environment variables are missing. Unprotected endpoints like /api/ml/extract allowed unauthorized access to simulation logic.
**Prevention:** Explicitly require JWT_SECRET and throw error if missing. Centralize authorization logic (canAccess) and apply to all sensitive routes.
