---
id: useSelector
title: useSelector
---

# Function: useSelector()

```ts
function useSelector<TAtom, T>(
   atom, 
   selector, 
   compare): T;
```

Defined in: [useSelector.ts:13](https://github.com/TanStack/store/blob/main/packages/react-store/src/useSelector.ts#L13)

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
