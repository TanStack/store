---
'@tanstack/store': patch
---

Fix `atom.set(undefined)` being ignored. A mutable atom now takes `undefined` as its new value and compares it like any other, so setting `undefined` again does not notify subscribers. Only an internal `_update()` call made with no argument is still skipped.
