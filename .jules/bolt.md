## 2025-05-22 - Database Indexing and Memoization
**Learning:** The `Claim` table is frequently queried by `patientId` and `hospitalId`, and sorted by `riskScore`. Without indexes, these operations become O(N). Similarly, the `AuditorDashboard` was performing O(N log N) sorting and multiple O(N) filters on every render.
**Action:** Always check for missing indexes on foreign keys and fields used in `WHERE` or `ORDER BY` clauses. Use `useMemo` for expensive data transformations (sorting, filtering) in React components that handle large datasets.
