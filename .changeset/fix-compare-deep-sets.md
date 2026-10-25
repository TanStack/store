---
'@tanstack/store': patch
---

fix(store): `compareDeep` no longer reports unequal Sets as equal. Each element is matched at most once, and failed comparisons are no longer cached as equal
