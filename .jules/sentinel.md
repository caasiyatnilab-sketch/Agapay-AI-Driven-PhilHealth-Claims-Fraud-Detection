## 2025-01-24 - [CRITICAL] Hardcoded JWT Secret and Information Leakage in Login API
**Vulnerability:** A hardcoded 'fallback-secret' was used for JWT signing and verification, and the login API leaked internal error messages.
**Learning:** Using fallback secrets in code leads to weak security if the primary environment variable is missing. Direct exposure of error messages can reveal system internals to attackers.
**Prevention:** Always require security-sensitive environment variables and throw errors if they are missing. Implement generic error handling in public-facing APIs to mask internal system details.
