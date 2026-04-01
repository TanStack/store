---
'@tanstack/react-store': patch
---

fix(react): use Object.is instead of === in defaultCompare to correctly handle NaN and -0 edge cases
