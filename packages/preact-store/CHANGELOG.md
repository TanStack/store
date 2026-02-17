# @tanstack/preact-store

## 0.11.0

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

### Patch Changes

- Updated dependencies [[`dace25f`](https://github.com/TanStack/store/commit/dace25f65c082b12b8b0fbcc5a5b6aa0b83bc8eb)]:
  - @tanstack/store@0.9.0

## 0.10.2

### Patch Changes

- Updated dependencies [[`3096bf2`](https://github.com/TanStack/store/commit/3096bf2132f33197c1b41ea00f875009705bc488)]:
  - @tanstack/store@0.8.1
