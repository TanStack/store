---
'@tanstack/svelte-store': patch
---

Fix `state_proxy_equality_mismatch` warning in `useSelector` by using `$state.raw()` instead of `$state()` for the slice variable. `$state()` wrapped object values in a Svelte Proxy, causing `===` comparison with the raw selector output to always fail, which triggered unnecessary re-renders and Svelte runtime warnings on every store update.
