---
id: Store
title: Store
---

# Class: Store\<T, TActions\>

Defined in: [store.ts:19](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L19)

## Type Parameters

### T

`T`

### TActions

`TActions` *extends* [`StoreActionMap`](../type-aliases/StoreActionMap.md) = `never`

## Constructors

### Constructor

```ts
new Store<T, TActions>(getValue): Store<T, TActions>;
```

Defined in: [store.ts:22](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L22)

#### Parameters

##### getValue

(`prev?`) => `T`

#### Returns

`Store`\<`T`, `TActions`\>

### Constructor

```ts
new Store<T, TActions>(initialValue): Store<T, TActions>;
```

Defined in: [store.ts:23](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L23)

#### Parameters

##### initialValue

`T`

#### Returns

`Store`\<`T`, `TActions`\>

### Constructor

```ts
new Store<T, TActions>(initialValue, actionsFactory): Store<T, TActions>;
```

Defined in: [store.ts:24](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L24)

#### Parameters

##### initialValue

`NonFunction`\<`T`\>

##### actionsFactory

[`StoreActionsFactory`](../type-aliases/StoreActionsFactory.md)\<`T`, `TActions`\>

#### Returns

`Store`\<`T`, `TActions`\>

## Properties

### actions

```ts
readonly actions: TActions;
```

Defined in: [store.ts:21](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L21)

## Accessors

### state

#### Get Signature

```ts
get state(): T;
```

Defined in: [store.ts:48](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L48)

##### Returns

`T`

## Methods

### get()

```ts
get(): T;
```

Defined in: [store.ts:51](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L51)

#### Returns

`T`

***

### setState()

```ts
setState(updater): void;
```

Defined in: [store.ts:45](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L45)

#### Parameters

##### updater

(`prev`) => `T`

#### Returns

`void`

***

### subscribe()

```ts
subscribe(observerOrFn): Subscription;
```

Defined in: [store.ts:54](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L54)

#### Parameters

##### observerOrFn

[`Observer`](../type-aliases/Observer.md)\<`T`\> | (`value`) => `void`

#### Returns

[`Subscription`](../interfaces/Subscription.md)
