# Bolt Performance Journal

## 2024-05-22 - [Stale Memory: Missing Database Indexes]
**Learning:** Memories suggested that composite database indexes were implemented in `lib/db.js`, but inspection of the file and database schema revealed they are missing. Relying on memory without verification can lead to false assumptions about performance state.
**Action:** Always verify the actual state of the codebase (e.g., via `read_file` or schema inspection) before assuming previous optimizations are active.
