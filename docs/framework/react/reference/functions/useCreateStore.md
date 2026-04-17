---
id: useCreateStore
title: useCreateStore
---

# Function: useCreateStore()

## Call Signature

```ts
function useCreateStore<T>(getValue): ReadonlyStore<T>;
```

Defined in: [packages/react-store/src/useCreateStore.ts:24](https://github.com/TanStack/store/blob/main/packages/react-store/src/useCreateStore.ts#L24)

Creates a stable store instance for the lifetime of the component.

Pass an initial value to create a writable store, or a getter function to
create a readonly derived store. This hook mirrors the overloads from
createStore, but ensures the store is only created once per mount.

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
const counterStore = useCreateStore({ count: 0 })
```

## Call Signature

```ts
function useCreateStore<T>(initialValue): Store<T>;
```

Defined in: [packages/react-store/src/useCreateStore.ts:27](https://github.com/TanStack/store/blob/main/packages/react-store/src/useCreateStore.ts#L27)

Creates a stable store instance for the lifetime of the component.

Pass an initial value to create a writable store, or a getter function to
create a readonly derived store. This hook mirrors the overloads from
createStore, but ensures the store is only created once per mount.

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
const counterStore = useCreateStore({ count: 0 })
```

## Call Signature

```ts
function useCreateStore<T, TActions>(initialValue, actions): Store<T, TActions>;
```

Defined in: [packages/react-store/src/useCreateStore.ts:28](https://github.com/TanStack/store/blob/main/packages/react-store/src/useCreateStore.ts#L28)

Creates a stable store instance for the lifetime of the component.

Pass an initial value to create a writable store, or a getter function to
create a readonly derived store. This hook mirrors the overloads from
createStore, but ensures the store is only created once per mount.

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
const counterStore = useCreateStore({ count: 0 })
```
