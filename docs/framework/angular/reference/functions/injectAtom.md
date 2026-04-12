---
id: injectAtom
title: injectAtom
---

# Function: injectAtom()

```ts
function injectAtom<TValue>(atom, options?): [Signal<TValue>, (fn) => void & (value) => void];
```

Defined in: [packages/angular-store/src/index.ts:197](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L197)

Returns the current atom signal together with a setter.

Use this when a component needs to both read and update the same writable
atom.

## Type Parameters

### TValue

`TValue`

## Parameters

### atom

`Atom`\<`TValue`\>

### options?

[`InjectSelectorOptions`](../interfaces/InjectSelectorOptions.md)\<`TValue`\>

## Returns

\[`Signal`\<`TValue`\>, (`fn`) => `void` & (`value`) => `void`\]

## Example

```ts
readonly atomTuple = injectAtom(countAtom)
readonly count = this.atomTuple[0]
readonly setCount = this.atomTuple[1]
```
