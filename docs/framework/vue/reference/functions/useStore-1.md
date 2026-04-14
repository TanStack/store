---
id: useStore
title: useStore
---

# ~~Function: useStore()~~

```ts
function useStore<TSource, TSelected>(
   source, 
   selector, 
compare?): Readonly<Ref<TSelected>>;
```

Defined in: [vue-store/src/useStore.ts:14](https://github.com/TanStack/store/blob/main/packages/vue-store/src/useStore.ts#L14)

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

`Readonly`\<`Ref`\<`TSelected`\>\>

## Example

```ts
const count = useStore(counterStore, (state) => state.count)
```

## Deprecated

Use `useSelector` instead.
