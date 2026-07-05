## 2025-05-15 - Form Accessibility and Micro-Feedback
**Learning:** Explicitly linking form labels to inputs using `id` and `htmlFor` is essential for screen reader accessibility and simplifies automated testing with Playwright. Providing immediate visual feedback through loading spinners during AI-simulated tasks (like OCR extraction) significantly improves perceived performance and prevents double-submissions.
**Action:** Always ensure `id`/`htmlFor` associations in forms and implement granular loading states for all asynchronous operations.
