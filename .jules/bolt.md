## 2026-07-03 - [Database Indexing for Scalable Querying]
**Learning:** The application's Auditor and Patient dashboards perform frequent filtering and sorting on `Claim` and `Notification` tables without any database indexes, leading to full table scans.
**Action:** Implemented composite and single-field indexes on `patientId`, `hospitalId`, `status`, `[riskScore, createdAt]`, and `[userId, createdAt]` to ensure O(log N) query performance.
