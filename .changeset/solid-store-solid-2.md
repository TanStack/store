---
'@tanstack/solid-store': major
---

Support Solid 2. `@tanstack/solid-store` now requires `solid-js` 2 (`^2.0.0`); stay on 0.11.x for Solid 1.

- `useSelector` and `useAtom` work unchanged. As with every Solid 2 signal, a value read right after a store write outside a reactive scope is not visible until Solid flushes. That usually happens on `flush()` from `solid-js` or the next microtask, but pending async work in the same update can hold it longer.
- `createStoreContext`'s `StoreProvider` renders the Solid 2 context directly and no longer needs a JSX runtime, so the adapter depends on `solid-js` only.
