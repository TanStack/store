---
id: useAtom
title: useAtom
---

# Function: useAtom()

```ts
function useAtom<TValue>(atom, options?): [Readonly<Ref<TValue, TValue>>, (fn) => void & (value) => void];
```

Defined in: vue-store/src/useAtom.ts:21

Returns the current atom ref together with a setter.

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

\[`Readonly`\<`Ref`\<`TValue`, `TValue`\>\>, (`fn`) => `void` & (`value`) => `void`\]

## Example

```ts
const [count, setCount] = useAtom(countAtom)

setCount((prev) => prev + 1)
console.log(count.value)
```
