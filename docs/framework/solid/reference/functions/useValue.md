---
id: useValue
title: useValue
---

# Function: useValue()

```ts
function useValue<TValue>(source, options?): Accessor<TValue>;
```

Defined in: [solid-store/src/useValue.ts:24](https://github.com/TanStack/store/blob/main/packages/solid-store/src/useValue.ts#L24)

Subscribes to an atom or store and returns its current value accessor.

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

`Accessor`\<`TValue`\>

## Examples

```tsx
const count = useValue(countAtom)

return <p>{count()}</p>
```

```tsx
const state = useValue(counterStore)
```
