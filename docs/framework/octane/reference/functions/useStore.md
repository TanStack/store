---
id: useStore
title: useStore
---

# ~~Function: useStore()~~

```ts
function useStore<TSource, TSelected>(
   source, 
   selector?, 
   compare?): TSelected;
```

Defined in: [octane-store/src/useStore.ts:22](https://github.com/TanStack/store/blob/main/packages/octane-store/src/useStore.ts#L22)

Deprecated alias for [useSelector](useSelector.md).

## Type Parameters

### TSource

`TSource`

### TSelected

`TSelected` = `NoInfer`\<`TSource`\>

## Parameters

### source

`SelectionSource`\<`TSource`\>

### selector?

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
