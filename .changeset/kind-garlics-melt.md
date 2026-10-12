---
'@tanstack/react-store': patch
---

Fix selections retained by mounted subscriptions and reduce selector callback allocation overhead. Use compact private selection cache fields to reduce consumer bundle size.
