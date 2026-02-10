---
id: useStore
title: useStore
---

# Function: useStore()

```ts
function useStore<TAtom, T>(
   atom, 
   selector, 
   compare): T;
```

Defined in: [useStore.ts:13](https://github.com/TanStack/store/blob/main/packages/react-store/src/useStore.ts#L13)

## Type Parameters

### TAtom

`TAtom` *extends* `AnyAtom` \| `undefined`

### T

`T`

## Parameters

### atom

`TAtom`

### selector

(`snapshot`) => `T`

### compare

(`a`, `b`) => `boolean`

## Returns

`T`
