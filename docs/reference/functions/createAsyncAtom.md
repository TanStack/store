---
id: createAsyncAtom
title: createAsyncAtom
---

# Function: createAsyncAtom()

```ts
function createAsyncAtom<T>(getValue, options?): ReadonlyAtom<AsyncAtomState<T, unknown>>;
```

Defined in: [atom.ts:88](https://github.com/TanStack/store/blob/main/packages/store/src/atom.ts#L88)

## Type Parameters

### T

`T`

## Parameters

### getValue

() => `Promise`\<`T`\>

### options?

[`AtomOptions`](../interfaces/AtomOptions.md)\<`AsyncAtomState`\<`T`, `unknown`\>\>

## Returns

[`ReadonlyAtom`](../interfaces/ReadonlyAtom.md)\<`AsyncAtomState`\<`T`, `unknown`\>\>
