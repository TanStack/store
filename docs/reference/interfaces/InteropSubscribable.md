---
id: InteropSubscribable
title: InteropSubscribable
---

# Interface: InteropSubscribable\<T\>

Defined in: [types.ts:5](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L5)

## Extended by

- [`Subscribable`](Subscribable.md)

## Type Parameters

### T

`T`

## Properties

### subscribe()

```ts
subscribe: (observer) => Subscription;
```

Defined in: [types.ts:6](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L6)

#### Parameters

##### observer

[`Observer`](../type-aliases/Observer.md)\<`T`\>

#### Returns

[`Subscription`](Subscription.md)
