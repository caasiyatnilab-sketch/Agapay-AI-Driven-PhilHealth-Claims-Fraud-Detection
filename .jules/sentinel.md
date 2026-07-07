## 2024-11-20 - Security Hardening & Authorization Centralization
**Vulnerability:** Broken Object Level Authorization (BOLA) and exposed internal endpoints.
**Learning:** Several endpoints (`/api/blockchain/claim/[id]`, `/api/blockchain/explore`, `/api/ml/extract`) were accessible without authentication, potentially exposing sensitive claim data and internal service logic.
**Prevention:** Centralized authorization helpers (`canAccess`) and strictly enforced `verifyAuth` on all sensitive API routes. Removed hardcoded secret fallbacks to ensure secure-by-default configuration.
