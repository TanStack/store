---
id: createStore
title: createStore
---

# Function: createStore()

## Call Signature

```ts
function createStore<T>(getValue): ReadonlyStore<T>;
```

Defined in: [store.ts:88](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L88)

### Type Parameters

#### T

`T`

### Parameters

#### getValue

(`prev?`) => `T`

### Returns

[`ReadonlyStore`](../classes/ReadonlyStore.md)\<`T`\>

## Call Signature

```ts
function createStore<T>(initialValue): Store<T>;
```

Defined in: [store.ts:91](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L91)

### Type Parameters

#### T

`T`

### Parameters

#### initialValue

`T`

### Returns

[`Store`](../classes/Store.md)\<`T`\>

## Call Signature

```ts
function createStore<T, TActions>(initialValue, actions): Store<T, TActions>;
```

Defined in: [store.ts:92](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L92)

### Type Parameters

#### T

`T`

#### TActions

`TActions` *extends* [`StoreActionMap`](../type-aliases/StoreActionMap.md)

### Parameters

#### initialValue

`NonFunction`\<`T`\>

#### actions

[`StoreActionsFactory`](../type-aliases/StoreActionsFactory.md)\<`T`, `TActions`\>

### Returns

[`Store`](../classes/Store.md)\<`T`, `TActions`\>
