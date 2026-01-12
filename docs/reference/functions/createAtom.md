---
id: createAtom
title: createAtom
---

# Function: createAtom()

## Call Signature

```ts
function createAtom<T>(getValue, options?): ReadonlyAtom<T>;
```

Defined in: [atom.ts:123](https://github.com/TanStack/store/blob/main/packages/store/src/atom.ts#L123)

### Type Parameters

#### T

`T`

### Parameters

#### getValue

(`prev?`) => `T`

#### options?

[`AtomOptions`](../interfaces/AtomOptions.md)\<`T`\>

### Returns

[`ReadonlyAtom`](../interfaces/ReadonlyAtom.md)\<`T`\>

## Call Signature

```ts
function createAtom<T>(initialValue, options?): Atom<T>;
```

Defined in: [atom.ts:127](https://github.com/TanStack/store/blob/main/packages/store/src/atom.ts#L127)

### Type Parameters

#### T

`T`

### Parameters

#### initialValue

`T`

#### options?

[`AtomOptions`](../interfaces/AtomOptions.md)\<`T`\>

### Returns

[`Atom`](../interfaces/Atom.md)\<`T`\>
