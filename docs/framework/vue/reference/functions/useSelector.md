---
id: useSelector
title: useSelector
---

# Function: useSelector()

```ts
function useSelector<TSource, TSelected>(
   source, 
   selector, 
options?): Readonly<Ref<TSelected>>;
```

Defined in: [vue-store/src/useSelector.ts:37](https://github.com/TanStack/store/blob/main/packages/vue-store/src/useSelector.ts#L37)

Selects a slice of state from an atom or store and subscribes the component
to that selection.

This is the primary Vue read hook for TanStack Store. It returns a readonly
ref containing the selected value.

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

`Readonly`\<`Ref`\<`TSelected`\>\>

## Examples

```ts
const count = useSelector(counterStore, (state) => state.count)
console.log(count.value)
```

```ts
const doubled = useSelector(countAtom, (value) => value * 2)
```
