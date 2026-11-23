---
id: useStore
title: useStore
---

```ts
function useStore<TSource, TSelected>(
   source, 
   selector?, 
   compare?): TSelected;
```

Defined in: [packages/react-store/src/useStore.ts:15](https://github.com/TanStack/store/blob/main/packages/react-store/src/useStore.ts#L15)

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
