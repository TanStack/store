---
id: useValue
title: useValue
---

# Function: useValue()

```ts
function useValue<TValue>(source, options?): TValue;
```

Defined in: react-store/src/useValue.ts:23

Subscribes to an atom or store and returns its current value.

This is the whole-value counterpart to [useSelector](useSelector.md). Use it when a
component needs the entire current value from a writable or readonly atom or
store. Pass `options.compare` to suppress rerenders when successive values
should be treated as equivalent.

## Type Parameters

### TValue

`TValue`

## Parameters

### source

`Atom`\<`TValue`\> | `ReadonlyAtom`\<`TValue`\> | `Store`\<`TValue`\> | `ReadonlyStore`\<`TValue`\>

### options?

[`UseSelectorOptions`](../interfaces/UseSelectorOptions.md)\<`TValue`\>

## Returns

`TValue`

## Examples

```tsx
const count = useValue(countAtom)
```

```tsx
const state = useValue(appStore)
```
