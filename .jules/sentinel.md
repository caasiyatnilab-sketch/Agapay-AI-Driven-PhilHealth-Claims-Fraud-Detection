## 2025-05-15 - Hardened Authentication and Authorization
**Vulnerability:** Hardcoded JWT fallback secret and unprotected blockchain API endpoint (IDOR).
**Learning:** Fallback secrets can lead to a false sense of security if the environment is misconfigured. Unprotected endpoints often bypass the main authorization flow.
**Prevention:** Always require explicit configuration of security-critical secrets and centralize authorization logic to ensure consistency across all API routes.
