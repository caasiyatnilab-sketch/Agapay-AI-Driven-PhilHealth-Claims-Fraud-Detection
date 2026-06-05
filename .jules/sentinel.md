## 2026-06-04 - Fix Insecure Direct Object Reference (IDOR) in Claims APIs
**Vulnerability:** Authenticated users could access any claim record by ID, regardless of ownership, because the API only verified authentication but not authorization/ownership.
**Learning:** Next.js dynamic routes (`[id]`) are particularly vulnerable if developers assume `verifyAuth()` handles all security. In multi-tenant or role-based systems, ownership must be explicitly checked against the resource.
**Prevention:** Always verify that the `user.id` or `user.hospitalId` matches the record's `patientId` or `hospitalId` before returning sensitive data. Use a standard authorization middleware or pattern across all resource-specific endpoints.
