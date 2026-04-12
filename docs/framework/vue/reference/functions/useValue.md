---
id: useValue
title: useValue
---

# Function: useValue()

```ts
function useValue<TValue>(source, options?): Readonly<Ref<TValue>>;
```

Defined in: vue-store/src/useValue.ts:23

Subscribes to an atom or store and returns its current value ref.

This is the whole-value counterpart to [useSelector](useSelector.md). Use it when the
component needs the entire current value from a source.

## Type Parameters

### TValue

`TValue`

## Parameters

### source

`Atom`\<`TValue`\> | `ReadonlyAtom`\<`TValue`\> | `Store`\<`TValue`, `any`\> | `ReadonlyStore`\<`TValue`\>

### options?

[`UseSelectorOptions`](../interfaces/UseSelectorOptions.md)\<`TValue`\>

## Returns

`Readonly`\<`Ref`\<`TValue`\>\>

## Examples

```ts
const count = useValue(countAtom)
console.log(count.value)
```

```ts
const state = useValue(counterStore)
```
