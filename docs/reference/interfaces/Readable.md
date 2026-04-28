---
id: Readable
title: Readable
---

# Interface: Readable\<T\>

Defined in: [types.ts:29](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L29)

## Extends

- [`Subscribable`](Subscribable.md)\<`T`\>

## Extended by

- [`BaseAtom`](BaseAtom.md)
- [`InternalBaseAtom`](InternalBaseAtom.md)

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

***

### subscribe

```ts
subscribe: (observer) => Subscription & (next, error?, complete?) => Subscription;
```

Defined in: [types.ts:21](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L21)

#### Inherited from

[`Subscribable`](Subscribable.md).[`subscribe`](Subscribable.md#subscribe)
