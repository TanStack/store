---
id: ReadonlyAtom
title: ReadonlyAtom
---

# Interface: ReadonlyAtom\<T\>

Defined in: [types.ts:68](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L68)

An atom that is read-only and cannot be set.

## Example

```ts
const atom = createAtom(() => 42);
// @ts-expect-error - Cannot set a readonly atom
atom.set(43);
```

## Extends

- [`BaseAtom`](BaseAtom.md)\<`T`\>

## Type Parameters

### T

`T`

## Properties

### get()

```ts
get: () => T;
```

Defined in: [types.ts:30](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L30)

#### Returns

`T`

#### Inherited from

[`BaseAtom`](BaseAtom.md).[`get`](BaseAtom.md#get)

***

### subscribe

```ts
subscribe: (observer) => Subscription & (next, error?, complete?) => Subscription;
```

Defined in: [types.ts:21](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L21)

#### Inherited from

[`BaseAtom`](BaseAtom.md).[`subscribe`](BaseAtom.md#subscribe)
