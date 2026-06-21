## 2025-05-15 - [Interactive Div-Buttons Accessibility]
**Learning:** Custom interactive elements (like div-based dropzones) must implement `role="button"`, `tabIndex="0"`, and `onKeyDown` handlers (supporting 'Enter' and 'Space') to be accessible to keyboard and screen reader users. Simply adding an `onClick` is insufficient for proper UX.
**Action:** Always check for non-semantic interactive elements and apply the `role`/`tabIndex`/`onKeyDown` pattern.
