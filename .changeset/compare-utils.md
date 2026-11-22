---
'@tanstack/store': patch
---

Add `compareShallow` and `compareDeep` equality helpers. Pass either one as the `compare` option to `useSelector` (or `injectSelector`) to skip updates when a selector returns a new object or array with the same contents.
