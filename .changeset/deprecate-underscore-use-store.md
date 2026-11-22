---
'@tanstack/react-store': patch
'@tanstack/preact-store': patch
'@tanstack/vue-store': patch
'@tanstack/solid-store': patch
'@tanstack/svelte-store': patch
---

Deprecate the experimental `_useStore` hook. Read state with `useSelector` and write through `store.actions` or `store.setState` instead. `_useStore` will be removed in the next major version.
