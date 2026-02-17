---
'@tanstack/angular-store': minor
'@tanstack/preact-store': minor
'@tanstack/svelte-store': minor
'@tanstack/react-store': minor
'@tanstack/solid-store': minor
'@tanstack/vue-store': minor
'@tanstack/store': minor
---

## Breaking changes

- `new Store()` is now `createStore()`
- `new Derived()` is now a derived `createStore()`:
  ```ts
  const derived = createStore(() => store.state * 2)
  ```
- `new Effect()` removed in favor of `store.subscribe()`:
  ```ts
  const {unsubscribe} = store.subscribe(() => {
    console.log(store.state)
  })
  ```
- Uses [alien-signals](https://github.com/nicepkg/alien-signals) under the hood for efficient reactivity
