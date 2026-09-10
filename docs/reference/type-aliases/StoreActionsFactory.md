---
id: StoreActionsFactory
title: StoreActionsFactory
---

```ts
type StoreActionsFactory<T, TActions> = (store) => TActions;
```

Defined in: [store.ts:8](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L8)

## Type Parameters

### T

`T`

### TActions

`TActions` *extends* [`StoreActionMap`](StoreActionMap.md)

## Parameters

### store

#### get

[`Store`](../classes/Store.md)\<`T`\>\[`"get"`\]

#### setState

[`Store`](../classes/Store.md)\<`T`\>\[`"setState"`\]

## Returns

`TActions`
