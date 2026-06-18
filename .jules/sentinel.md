## 2025-05-15 - Hardcoded Fallback Secrets
**Vulnerability:** The application used a hardcoded string `'fallback-secret'` as a default for JWT signing and verification when the `JWT_SECRET` environment variable was not set.
**Learning:** Providing a fallback secret allowed the application to remain functional in misconfigured or local environments, but it created a significant security risk where a known weak secret could be used in production.
**Prevention:** Always validate that critical security configurations like `JWT_SECRET` are present. If missing, the application should fail to start or throw a clear error during authentication attempts to prevent running in an insecure state.

## 2025-05-15 - Unprotected API Endpoints
**Vulnerability:** Multiple API endpoints (`/api/hospitals`, `/api/ml/extract`) were exposed without any authentication or authorization checks, allowing unauthenticated users to access hospital lists and trigger ML processing.
**Learning:** These endpoints were likely overlooked during initial development or as part of "simulated" features, leading to inconsistent security coverage across the API.
**Prevention:** Adopt a "secure by default" approach. Every new API route must be audited for authentication and authorization needs. Centralizing the `verifyAuth` logic helps, but it must be explicitly invoked in every protected route handler.
