---
id: injectAtom
title: injectAtom
---

# Function: injectAtom()

```ts
function injectAtom<TValue>(atom, options?): WritableAtomSignal<TValue>;
```

Defined in: [packages/angular-store/src/injectAtom.ts:44](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectAtom.ts#L44)

Returns a [WritableAtomSignal](../interfaces/WritableAtomSignal.md) that reads the current atom value when
called and exposes a `.set` method for updates.

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

[`WritableAtomSignal`](../interfaces/WritableAtomSignal.md)\<`TValue`\>

## Example

```ts
readonly count = injectAtom(countAtom)

increment() {
  this.count.set((prev) => prev + 1)
}
```
