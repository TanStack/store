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

Defined in: [preact-store/src/useSelector.ts:128](https://github.com/TanStack/store/blob/main/packages/preact-store/src/useSelector.ts#L128)

Selects a slice of state from an atom or store and subscribes the component
to that selection.

This is the primary Preact read hook for TanStack Store. Use it when a
component only needs part of a source value, or omit the selector to
subscribe to the whole value.

## Type Parameters

### TSource

`TSource`

### TSelected

`TSelected` = `NoInfer`\<`TSource`\>

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
const value = useSelector(countAtom)
```
