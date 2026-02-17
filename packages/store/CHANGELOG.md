# @tanstack/store

## 0.9.0

### Minor Changes

- ## Breaking changes ([#265](https://github.com/TanStack/store/pull/265))
  - `new Store()` is now `createStore()`
  - `new Derived()` is now a derived `createStore()`:
    ```ts
    const derived = createStore(() => store.state * 2)
    ```
  - `new Effect()` removed in favor of `store.subscribe()`:
    ```ts
    const { unsubscribe } = store.subscribe(() => {
      console.log(store.state)
    })
    ```
  - Uses [alien-signals](https://github.com/nicepkg/alien-signals) under the hood for efficient reactivity

## 0.8.1

### Patch Changes

- Fix Issues with Derived Fields not Retriggering ([#274](https://github.com/TanStack/store/pull/274))
