## 2025-05-15 - IDOR in Blockchain Claim Explorer
**Vulnerability:** The `/api/blockchain/claim/[id]` endpoint was completely public, allowing any unauthenticated user to query sensitive claim data from both the blockchain and the local database.
**Learning:** Security controls were correctly applied to standard REST endpoints (`/api/claims/[id]`) but were overlooked in "explorer" or "blockchain" utility endpoints that surfaced the same sensitive data.
**Prevention:** Always verify that every endpoint surfacing PII or sensitive business data (regardless of the underlying technology like blockchain) implements the core `verifyAuth` and ownership check pattern used elsewhere in the app.
