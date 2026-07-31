## 2025-05-14 - [Accessibility redundancy]
**Learning:** Adding role="img" to a container that already includes clear text content (like "AGAPAY") can lead to redundant or confusing announcements for screen reader users. It is better to use aria-label on the container to provide context without declaring it an image if it's text-based.
**Action:** Use aria-label on text-based logo containers instead of role="img" to avoid redundant announcements.
