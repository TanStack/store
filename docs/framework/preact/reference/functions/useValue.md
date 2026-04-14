---
id: useValue
title: useValue
---

# Function: useValue()

```ts
function useValue<TValue>(source, options?): TValue;
```

Defined in: [preact-store/src/useValue.ts:22](https://github.com/TanStack/store/blob/main/packages/preact-store/src/useValue.ts#L22)

Subscribes to an atom or store and returns its current value.

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

`TValue`

## Examples

```tsx
const count = useValue(countAtom)
```

```tsx
const state = useValue(counterStore)
```
