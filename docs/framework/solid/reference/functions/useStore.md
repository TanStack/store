---
id: useStore
title: useStore
---

# ~~Function: useStore()~~

```ts
function useStore<TSource, TSelected>(
   source, 
   selector, 
compare?): Accessor<TSelected>;
```

Defined in: solid-store/src/useStore.ts:14

Deprecated alias for [useSelector](useSelector.md).

## Type Parameters

### TSource

`TSource`

### TSelected

`TSelected`

## Parameters

### source

#### get

() => `TSource`

#### subscribe

(`listener`) => `object`

### selector

(`snapshot`) => `TSelected`

### compare?

(`a`, `b`) => `boolean`

## Returns

`Accessor`\<`TSelected`\>

## Example

```tsx
const count = useStore(counterStore, (state) => state.count)
```

## Deprecated

Use `useSelector` instead.
