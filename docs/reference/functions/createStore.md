---
id: createStore
title: createStore
---

# Function: createStore()

## Call Signature

```ts
function createStore<T>(getValue): Store<T>;
```

Defined in: [store.ts:31](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L31)

### Type Parameters

#### T

`T`

### Parameters

#### getValue

(`prev?`) => `T`

### Returns

[`Store`](../classes/Store.md)\<`T`\>

## Call Signature

```ts
function createStore<T>(initialValue): Store<T>;
```

Defined in: [store.ts:32](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L32)

### Type Parameters

#### T

`T`

### Parameters

#### initialValue

`T`

### Returns

[`Store`](../classes/Store.md)\<`T`\>
