## 2024-05-15 - Security Hardening & Information Leakage Prevention

**Vulnerability:** Several security gaps were identified:
1.  **Hardcoded JWT Secret Fallback:** Both `lib/auth.js` and `app/api/auth/login/route.js` used a hardcoded 'fallback-secret' when `JWT_SECRET` was missing, potentially allowing attackers to forge tokens if they knew the fallback.
2.  **Sensitive File Tracking:** The `.env.local` file containing a private key (`HARDHAT_PRIVATE_KEY`) was tracked in Git.
3.  **Unauthenticated API Endpoints:** `/api/hospitals`, `/api/blockchain/explore`, and `/api/ml/extract` were accessible without authentication.
4.  **IDOR in Blockchain Explorer:** `/api/blockchain/claim/[id]` allowed anyone to view any claim's data (both on-chain and database) without checking if the requester was the patient, the hospital, or an auditor.

**Learning:** Development-time fallbacks and "convenience" endpoints often bypass the core security model if not strictly enforced. Tracking `.env.local` is a common but critical misconfiguration.

**Prevention:**
- Fail closed: Throw errors if security-critical environment variables like `JWT_SECRET` are missing.
- Centralize authorization logic to prevent Insecure Direct Object Reference (IDOR).
- Ensure a `.gitignore` is present and covers all environment files from day one.
- Audit all API routes for consistent authentication middleware usage.
