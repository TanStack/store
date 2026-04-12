---
id: useSelector
title: useSelector
---

# Function: useSelector()

```ts
function useSelector<TSource, TSelected>(
   source, 
   selector, 
options?): Accessor<TSelected>;
```

Defined in: solid-store/src/useSelector.ts:38

Selects a slice of state from an atom or store and subscribes the component
to that selection.

This is the primary Solid read hook for TanStack Store. It returns a Solid
accessor so consumers can read the selected value reactively.

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

`Accessor`\<`TSelected`\>

## Examples

```tsx
const count = useSelector(counterStore, (state) => state.count)

return <p>{count()}</p>
```

```tsx
const doubled = useSelector(countAtom, (value) => value * 2)
```
