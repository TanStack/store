---
id: useAtom
title: useAtom
---

# Function: useAtom()

```ts
function useAtom<TValue>(atom, options?): [TValue, (fn) => void & (value) => void];
```

Defined in: preact-store/src/useAtom.ts:23

Returns the current atom value together with a stable setter.

Use this when a component needs to both read and update the same writable
atom.

## Type Parameters

### TValue

`TValue`

## Parameters

### atom

`Atom`\<`TValue`\>

### options?

[`UseSelectorOptions`](../interfaces/UseSelectorOptions.md)\<`TValue`\>

## Returns

\[`TValue`, (`fn`) => `void` & (`value`) => `void`\]

## Example

```tsx
const [count, setCount] = useAtom(countAtom)

return (
  <button type="button" onClick={() => setCount((prev) => prev + 1)}>
    {count}
  </button>
)
```
