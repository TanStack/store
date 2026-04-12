---
id: useAtom
title: useAtom
---

# Function: useAtom()

```ts
function useAtom<TValue>(atom, options?): [Accessor<TValue>, (fn) => void & (value) => void];
```

Defined in: [solid-store/src/useAtom.ts:24](https://github.com/TanStack/store/blob/main/packages/solid-store/src/useAtom.ts#L24)

Returns the current atom accessor together with a setter.

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

\[`Accessor`\<`TValue`\>, (`fn`) => `void` & (`value`) => `void`\]

## Example

```tsx
const [count, setCount] = useAtom(countAtom)

return (
  <button type="button" onClick={() => setCount((prev) => prev + 1)}>
    {count()}
  </button>
)
```
