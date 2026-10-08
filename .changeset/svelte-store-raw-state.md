---
'@tanstack/svelte-store': patch
---

Use `$state.raw` in `useSelector` to prevent proxy equality mismatch and preserve object identity
