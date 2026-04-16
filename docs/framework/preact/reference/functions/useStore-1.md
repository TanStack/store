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

Defined in: [preact-store/src/useStore.ts:13](https://github.com/TanStack/store/blob/main/packages/preact-store/src/useStore.ts#L13)

Deprecated alias for [useSelector](useSelector.md).

## Type Parameters

### TSource

`TSource`

### TSelected

`TSelected` = `NoInfer`\<`TSource`\>

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

## Example

```tsx
const count = useStore(counterStore, (state) => state.count)
```

## Deprecated

Use `useSelector` instead.
