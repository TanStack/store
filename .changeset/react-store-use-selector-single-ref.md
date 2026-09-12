---
'@tanstack/react-store': major
---

`@tanstack/react-store` now requires React 18 or newer (`peerDependencies` are `react` and `react-dom` `^18.0.0 || ^19.0.0`); support for React 16.8 and 17 has been dropped.

`useSelector` builds on React's built-in `useSyncExternalStore` with a single memoized selection ref instead of the `use-sync-external-store/shim/with-selector` helper: fewer hook slots and allocations per subscribed component, no per-component passive effect, and the `use-sync-external-store` dependency is gone from consumer bundles. The public API and selection semantics of `useSelector`, `useAtom`, `_useStore` and `useStore` are unchanged.
