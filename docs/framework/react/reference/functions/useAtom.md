---
id: useAtom
title: useAtom
---

# Function: useAtom()

```ts
function useAtom<TValue>(atom, options?): [TValue, (fn) => void & (value) => void];
```

Defined in: [packages/react-store/src/useAtom.ts:16](https://github.com/TanStack/store/blob/main/packages/react-store/src/useAtom.ts#L16)

Returns the current atom value together with a stable setter.

This is the writable-atom convenience hook for components that need to both
read and update the same atom.

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
```
