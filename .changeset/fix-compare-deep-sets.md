---
'@tanstack/store': patch
---

`compareDeep` no longer reports unequal Sets as equal. Each element is matched at most once, and failed comparisons are no longer cached as equal. Values nested more than 500 levels deep are now reported as unequal instead of overflowing the stack.
