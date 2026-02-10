---
'@tanstack/angular-store': major
'@tanstack/preact-store': major
'@tanstack/svelte-store': major
'@tanstack/react-store': major
'@tanstack/solid-store': major
'@tanstack/vue-store': major
'@tanstack/store': major
---

## Breaking changes

- `new Store()` is now `createStore()`
- `new Derived()` is now a derived `createStore()`:
  ```ts
  const derived = createStore(() => store.state * 2)
  ```
- Uses [alien-signals](https://github.com/nicepkg/alien-signals) under the hood for efficient reactivity
