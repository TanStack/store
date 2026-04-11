---
id: useSelector
title: useSelector
---

# Function: useSelector()

```ts
function useSelector<TSource, TSelected>(
   source, 
   selector, 
   options?): TSelected;
```

Defined in: [react-store/src/useSelector.ts:41](https://github.com/TanStack/store/blob/main/packages/react-store/src/useSelector.ts#L41)

Selects a slice of state from an atom or store and subscribes the component
to that selection.

This is the primary React read hook for TanStack Store. It works with any
source that exposes `get()` and `subscribe()`, including atoms, readonly
atoms, stores, and readonly stores.

## Type Parameters

### TSource

`TSource`

### TSelected

`TSelected`

## Parameters

### source

`SelectionSource`\<`TSource`\>

### selector

(`snapshot`) => `TSelected`

### options?

[`UseSelectorOptions`](../interfaces/UseSelectorOptions.md)\<`TSelected`\>

## Returns

`TSelected`

## Examples

```tsx
const count = useSelector(counterStore, (state) => state.count)
```

```tsx
const count = useSelector(countAtom, (value) => value)
```
