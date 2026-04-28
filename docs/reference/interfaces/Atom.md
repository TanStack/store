---
id: Atom
title: Atom
---

# Interface: Atom\<T\>

Defined in: [types.ts:42](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L42)

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

### set

```ts
set: (fn) => void & (value) => void;
```

Defined in: [types.ts:44](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L44)

Sets the value of the atom using a function.

***

### subscribe

```ts
subscribe: (observer) => Subscription & (next, error?, complete?) => Subscription;
```

Defined in: [types.ts:21](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L21)

#### Inherited from

[`BaseAtom`](BaseAtom.md).[`subscribe`](BaseAtom.md#subscribe)
