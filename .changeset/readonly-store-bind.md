---
'@tanstack/store': patch
---

Bind `get` and `subscribe` on `ReadonlyStore`, so they work when destructured, as they do on `Store`
