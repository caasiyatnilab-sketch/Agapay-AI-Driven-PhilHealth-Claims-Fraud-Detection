## 2025-05-15 - [BOLA/IDOR in Blockchain Claim API]
**Vulnerability:** The `/api/blockchain/claim/[id]` endpoint was public and lacked ownership checks, allowing any user (or unauthenticated requester) to view claim data from the blockchain and database.
**Learning:** External data sources (like blockchain) often get bypassed during security reviews if they are considered "public", but when combined with database fallbacks and application-specific metadata, they can leak sensitive user information.
**Prevention:** Always wrap data-accessing endpoints with authentication and role-based access control (RBAC) that matches the application's data ownership model, regardless of the data source.
