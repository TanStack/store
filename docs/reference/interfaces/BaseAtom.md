---
id: BaseAtom
title: BaseAtom
---

# Interface: BaseAtom\<T\>

Defined in: [types.ts:33](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L33)

## Extends

- [`Subscribable`](Subscribable.md)\<`T`\>.[`Readable`](Readable.md)\<`T`\>

## Extended by

- [`Atom`](Atom.md)
- [`ReadonlyAtom`](ReadonlyAtom.md)

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

[`Readable`](Readable.md).[`get`](Readable.md#get)

***

### subscribe

```ts
subscribe: (observer) => Subscription & (next, error?, complete?) => Subscription;
```

Defined in: [types.ts:21](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L21)

#### Inherited from

[`Subscribable`](Subscribable.md).[`subscribe`](Subscribable.md#subscribe)
