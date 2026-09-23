---
'@tanstack/preact-store': patch
---

Fix stale `useSelector` results when a selector changes while the store snapshot stays unchanged, including selectors that capture component props. Preserve snapshot caching for selectors that return fresh arrays or objects.
