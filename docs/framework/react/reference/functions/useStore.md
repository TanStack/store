---
id: useStore
title: useStore
---

# ~~Function: useStore()~~

```ts
function useStore<TSource, TSelected>(
   source, 
   selector, 
   compare?): TSelected;
```

Defined in: [packages/react-store/src/useStore.ts:8](https://github.com/TanStack/store/blob/main/packages/react-store/src/useStore.ts#L8)

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

`TSelected`

## Deprecated

Use `useSelector` instead.
