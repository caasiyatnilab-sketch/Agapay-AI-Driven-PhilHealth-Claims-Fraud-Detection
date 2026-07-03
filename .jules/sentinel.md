## 2025-05-15 - Unauthenticated Sensitive Endpoints and Hardcoded Secrets
**Vulnerability:** Several API endpoints (/api/blockchain/explore, /api/ml/extract) were accessible without authentication. Additionally, a hardcoded 'fallback-secret' was used for JWT verification if the environment variable was missing.
**Learning:** Rapid development often leads to boilerplate code being left in production-like environments, and utility endpoints (like ML or Blockchain explorer) are sometimes overlooked in the security audit of the core flow.
**Prevention:** Always centralize authentication and authorization logic. Enforce a 'deny-by-default' policy for all new API routes and ensure that critical configuration like JWT_SECRET is mandatory for the application to start/function.
