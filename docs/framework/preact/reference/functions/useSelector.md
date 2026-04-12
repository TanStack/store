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

Defined in: [preact-store/src/useSelector.ts:127](https://github.com/TanStack/store/blob/main/packages/preact-store/src/useSelector.ts#L127)

Selects a slice of state from an atom or store and subscribes the component
to that selection.

This is the primary Preact read hook for TanStack Store. Use it when a
component only needs part of a source value.

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
const doubled = useSelector(countAtom, (value) => value * 2)
```
