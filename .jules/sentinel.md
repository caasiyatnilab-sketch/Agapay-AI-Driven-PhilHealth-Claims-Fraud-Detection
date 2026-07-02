## 2024-05-22 - Centralized Authorization and Secret Hardening
**Vulnerability:** Use of hardcoded 'fallback-secret' for JWT and unprotected API endpoints (BOLA).
**Learning:** Default fallbacks for secrets can lead to insecure deployments. Publicly exposed internal APIs (ML, Blockchain explorer) lack required identity verification.
**Prevention:** Remove all hardcoded secret fallbacks and enforce `JWT_SECRET` presence. Centralize `canAccess` logic to ensure consistent BOLA protection across all claim-related endpoints.
