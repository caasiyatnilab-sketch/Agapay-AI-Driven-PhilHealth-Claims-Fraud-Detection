## 2025-05-14 - [JWT Hardcoded Fallback Secret]
**Vulnerability:** The application used a hardcoded 'fallback-secret' for JWT signing and verification when the JWT_SECRET environment variable was missing.
**Learning:** Hardcoded secrets in code are easily discoverable and compromise the entire authentication system if the environment is not perfectly configured.
**Prevention:** Always require secrets to be provided via environment variables and throw an explicit error during startup or execution if they are missing.

## 2025-05-14 - [Insecure Direct Object Reference (IDOR) in Blockchain Explorer]
**Vulnerability:** The endpoint `/api/blockchain/claim/[id]` was completely unprotected, allowing any user (or unauthenticated attacker) to view claim details by ID.
**Learning:** New endpoints or those bridging different systems (like a blockchain explorer) can easily be overlooked during security audits.
**Prevention:** Centralize authorization logic (like a `canAccess` helper) and ensure every new endpoint that returns sensitive data applies it.

## 2025-05-14 - [Unprotected Service Endpoints]
**Vulnerability:** The `/api/ml/extract` endpoint lacked authentication, allowing anyone to potentially abuse the OCR/extraction service.
**Learning:** Internal or utility services are often left open under the assumption they aren't "sensitive," but they can lead to resource exhaustion or data scraping.
**Prevention:** Default to "authenticated only" for all API routes and explicitly opt-out only for public discovery endpoints.
