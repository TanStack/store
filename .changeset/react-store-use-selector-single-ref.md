---
'@tanstack/react-store': patch
---

`useSelector` now builds on `useSyncExternalStore` directly with a single memoized selection ref instead of the `use-sync-external-store/shim/with-selector` helper: fewer hook slots and allocations per subscribed component, no per-component passive effect, and the `with-selector` module leaves consumer bundles. Public API and semantics are unchanged.
