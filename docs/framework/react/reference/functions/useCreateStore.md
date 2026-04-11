---
id: useCreateStore
title: useCreateStore
---

# Function: useCreateStore()

## Call Signature

```ts
function useCreateStore<T>(getValue): ReadonlyStore<T>;
```

Defined in: [react-store/src/useCreateStore.ts:17](https://github.com/TanStack/store/blob/main/packages/react-store/src/useCreateStore.ts#L17)

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

Defined in: [react-store/src/useCreateStore.ts:20](https://github.com/TanStack/store/blob/main/packages/react-store/src/useCreateStore.ts#L20)

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
