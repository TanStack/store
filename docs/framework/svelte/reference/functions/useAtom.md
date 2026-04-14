---
id: useAtom
title: useAtom
---

# Function: useAtom()

```ts
function useAtom<TValue>(atom, options?): [{
  current: TValue;
}, (fn) => void & (value) => void];
```

Defined in: [svelte-store/src/useAtom.ts:18](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/useAtom.ts#L18)

Returns the current atom holder together with a setter.

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

\[\{
  `current`: `TValue`;
\}, (`fn`) => `void` & (`value`) => `void`\]

## Example

```ts
const [count, setCount] = useAtom(countAtom)
setCount((prev) => prev + 1)
console.log(count.current)
```
