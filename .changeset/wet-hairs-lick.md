---
'@tanstack/store': patch
---

Fix a regression where mutable atoms could be updated internally with no updater and have their snapshot replaced with `undefined`.

Mutable atoms now ignore internal no-argument `_update()` calls, while computed atoms keep existing recomputation behavior. This prevents external-store state from disappearing during reactive graph cleanup.
