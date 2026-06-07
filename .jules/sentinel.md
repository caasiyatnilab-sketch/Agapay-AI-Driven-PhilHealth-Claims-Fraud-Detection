## 2024-05-24 - JWT Secret Fallback and Exposed Explorer Endpoints
**Vulnerability:** Use of a hardcoded 'fallback-secret' for JWT signing/verification and unauthenticated access to blockchain claim data.
**Learning:** Defaulting to insecure fallbacks for environment variables and neglecting authentication on supplemental data endpoints (like blockchain explorers) can lead to complete authentication bypass and data leakage.
**Prevention:** Always enforce the presence of security-critical environment variables and apply consistent authentication/authorization patterns across ALL data-retrieval endpoints.
