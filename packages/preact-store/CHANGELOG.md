# @tanstack/preact-store

## 0.13.1

### Patch Changes

- useSelector handles unstable selector functions now ([#318](https://github.com/TanStack/store/pull/318))

## 0.13.0

### Minor Changes

- Hooks included in this release: ([#306](https://github.com/TanStack/store/pull/306))
  - useAtom
  - useSelector
  - useStore (deprecated, replaced by useSelector)
  - createStoreContext (provides StoreProvider and useStoreContext for context-based consumption)

### Patch Changes

- Updated dependencies [[`4d87a83`](https://github.com/TanStack/store/commit/4d87a83158d0966cbbaf38cd51419693641f57fa)]:
  - @tanstack/store@0.11.0

## 0.12.0

### Minor Changes

- chore: update deps and change build process to tsdown ([#304](https://github.com/TanStack/store/pull/304))

### Patch Changes

- Updated dependencies [[`66e3010`](https://github.com/TanStack/store/commit/66e30108f49b5bf4c9796c9c98a009c08520c9a9)]:
  - @tanstack/store@0.10.0

## 0.11.3

### Patch Changes

- Updated dependencies [[`d8b51a7`](https://github.com/TanStack/store/commit/d8b51a7e2b8e42a38d6dab9e4aae139d6fb1c153)]:
  - @tanstack/store@0.9.3

## 0.11.2

### Patch Changes

- Updated dependencies [[`84dc3eb`](https://github.com/TanStack/store/commit/84dc3eb3fac116fdf5c2a527b017a44e848be6f3)]:
  - @tanstack/store@0.9.2

## 0.11.1

### Patch Changes

- Updated dependencies [[`77c872f`](https://github.com/TanStack/store/commit/77c872fcbbc399374a9a0bc1c31568097bd20cf6)]:
  - @tanstack/store@0.9.1

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
