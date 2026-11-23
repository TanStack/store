---
'@tanstack/angular-store': major
'@tanstack/preact-store': major
'@tanstack/react-store': major
'@tanstack/solid-store': major
'@tanstack/svelte-store': major
'@tanstack/vue-store': major
---

Remove the deprecated store hooks. Read state with `useSelector` (`injectSelector` in Angular) and update it through `store.actions` or `store.setState`.

- `useStore` and `injectStore` are removed. They were aliases for `useSelector` and `injectSelector`, so rename the calls.
- The experimental `_useStore` and `_injectStore` hooks are removed. Replace `const [value, actions] = _useStore(store, selector)` with `const value = useSelector(store, selector)` and `const actions = store.actions`. For a store without actions, call `store.setState` instead.
