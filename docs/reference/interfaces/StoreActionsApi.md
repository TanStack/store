---
id: StoreActionsApi
title: StoreActionsApi
---

# Interface: StoreActionsApi\<T\>

Defined in: [store.ts:4](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L4)

## Type Parameters

### T

`T`

## Properties

### get()

```ts
get: () => T;
```

Defined in: [store.ts:6](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L6)

#### Returns

`T`

***

### set()

```ts
set: (updater) => void;
```

Defined in: [store.ts:5](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L5)

#### Parameters

##### updater

(`prev`) => `T`

#### Returns

`void`
