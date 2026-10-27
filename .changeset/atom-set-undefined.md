---
'@tanstack/store': patch
---

Fix `atom.set(undefined)` being ignored. A mutable atom now takes `undefined` as its new value, and only an internal `_update()` call made with no argument is still skipped.
