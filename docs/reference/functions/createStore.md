---
id: createStore
title: createStore
---

# Function: createStore()

## Call Signature

```ts
function createStore<T>(getValue): ReadonlyStore<T>;
```

Defined in: [store.ts:86](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L86)

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

Defined in: [store.ts:89](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L89)

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

Defined in: [store.ts:90](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L90)

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
