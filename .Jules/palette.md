## 2025-05-15 - [Accessible Custom Interactive Elements]
**Learning:** In a Next.js/React environment where standard UI libraries might not be pre-configured, using a `div` as a custom action trigger (like an OCR dropzone) requires manual wiring of ARIA roles, `tabIndex`, and `onKeyDown` handlers to satisfy accessibility requirements.
**Action:** Always check for `onClick` handlers on non-semantic elements and supplement them with `role="button"`, `tabIndex="0"`, and keyboard support (Enter/Space) to ensure the interface is navigable for all users.
