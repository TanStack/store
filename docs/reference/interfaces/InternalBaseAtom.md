---
id: InternalBaseAtom
title: InternalBaseAtom
---

# Interface: InternalBaseAtom\<T\>

Defined in: [types.ts:35](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L35)

## Extends

- [`Subscribable`](Subscribable.md)\<`T`\>.[`Readable`](Readable.md)\<`T`\>

## Extended by

- [`InternalReadonlyAtom`](InternalReadonlyAtom.md)

## Type Parameters

### T

`T`

## Properties

### \_snapshot

```ts
_snapshot: T;
```

Defined in: [types.ts:37](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L37)

**`Internal`**

***

### \_update()

```ts
_update: (getValue?) => boolean;
```

Defined in: [types.ts:39](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L39)

**`Internal`**

#### Parameters

##### getValue?

`T` | (`snapshot`) => `T`

#### Returns

`boolean`

***

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
