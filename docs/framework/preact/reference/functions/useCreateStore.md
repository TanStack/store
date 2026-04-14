---
id: useCreateStore
title: useCreateStore
---

# Function: useCreateStore()

## Call Signature

```ts
function useCreateStore<T>(getValue): ReadonlyStore<T>;
```

Defined in: [preact-store/src/useCreateStore.ts:38](https://github.com/TanStack/store/blob/main/packages/preact-store/src/useCreateStore.ts#L38)

Creates a stable store instance for the lifetime of the component.

Pass an initial value to create a writable store, or a getter function to
create a readonly derived store. This mirrors createStore, but only
creates the store once per component mount.

### Type Parameters

#### T

`T`

### Parameters

#### getValue

(`prev?`) => `T`

### Returns

`ReadonlyStore`\<`T`\>

### Example

```tsx
function Counter() {
  const counterStore = useCreateStore({ count: 0 })
  const count = useSelector(counterStore, (state) => state.count)
  const setState = useSetValue(counterStore)

  return (
    <button
      type="button"
      onClick={() => setState((state) => ({ ...state, count: state.count + 1 }))}
    >
      {count}
    </button>
  )
}
```

## Call Signature

```ts
function useCreateStore<T>(initialValue): Store<T>;
```

Defined in: [preact-store/src/useCreateStore.ts:41](https://github.com/TanStack/store/blob/main/packages/preact-store/src/useCreateStore.ts#L41)

Creates a stable store instance for the lifetime of the component.

Pass an initial value to create a writable store, or a getter function to
create a readonly derived store. This mirrors createStore, but only
creates the store once per component mount.

### Type Parameters

#### T

`T`

### Parameters

#### initialValue

`T`

### Returns

`Store`\<`T`\>

### Example

```tsx
function Counter() {
  const counterStore = useCreateStore({ count: 0 })
  const count = useSelector(counterStore, (state) => state.count)
  const setState = useSetValue(counterStore)

  return (
    <button
      type="button"
      onClick={() => setState((state) => ({ ...state, count: state.count + 1 }))}
    >
      {count}
    </button>
  )
}
```

## Call Signature

```ts
function useCreateStore<T, TActions>(initialValue, actions): Store<T, TActions>;
```

Defined in: [preact-store/src/useCreateStore.ts:42](https://github.com/TanStack/store/blob/main/packages/preact-store/src/useCreateStore.ts#L42)

Creates a stable store instance for the lifetime of the component.

Pass an initial value to create a writable store, or a getter function to
create a readonly derived store. This mirrors createStore, but only
creates the store once per component mount.

### Type Parameters

#### T

`T`

#### TActions

`TActions` *extends* `StoreActionMap`

### Parameters

#### initialValue

`NonFunction`\<`T`\>

#### actions

`StoreActionsFactory`\<`T`, `TActions`\>

### Returns

`Store`\<`T`, `TActions`\>

### Example

```tsx
function Counter() {
  const counterStore = useCreateStore({ count: 0 })
  const count = useSelector(counterStore, (state) => state.count)
  const setState = useSetValue(counterStore)

  return (
    <button
      type="button"
      onClick={() => setState((state) => ({ ...state, count: state.count + 1 }))}
    >
      {count}
    </button>
  )
}
```
