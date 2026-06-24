## 2025-05-15 - Consolidating Dashboard Render Computations
**Learning:** React components often perform multiple redundant O(N) or O(N log N) operations (like filtering, reducing, and sorting the same data array) directly in the render body. These can be consolidated into a single O(N) pass and memoized to significantly reduce CPU usage during re-renders, especially as data grows.
**Action:** Use `useMemo` to perform a single `forEach` pass for all statistical aggregations and a single sort (on a copy) of the main data array.

## 2025-05-15 - Parallelizing Initial Data Fetching
**Learning:** Sequential `await` calls for independent API endpoints (e.g., fetching main list and then fetching analytics summary) create unnecessary "waterfall" delays.
**Action:** Use `Promise.all` to fetch independent data sources concurrently, reducing total dashboard load time by the duration of the fastest request.
