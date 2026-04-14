---
id: Store
title: Store
---

# Class: Store\<T, TActions\>

Defined in: [store.ts:15](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L15)

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

Defined in: [store.ts:18](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L18)

#### Parameters

##### getValue

(`prev?`) => `T`

#### Returns

`Store`\<`T`, `TActions`\>

### Constructor

```ts
new Store<T, TActions>(initialValue): Store<T, TActions>;
```

Defined in: [store.ts:19](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L19)

#### Parameters

##### initialValue

`T`

#### Returns

`Store`\<`T`, `TActions`\>

### Constructor

```ts
new Store<T, TActions>(initialValue, actionsFactory): Store<T, TActions>;
```

Defined in: [store.ts:20](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L20)

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

Defined in: [store.ts:17](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L17)

## Accessors

### state

#### Get Signature

```ts
get state(): T;
```

Defined in: [store.ts:44](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L44)

##### Returns

`T`

## Methods

### get()

```ts
get(): T;
```

Defined in: [store.ts:47](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L47)

#### Returns

`T`

***

### setState()

```ts
setState(updater): void;
```

Defined in: [store.ts:41](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L41)

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

Defined in: [store.ts:50](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L50)

#### Parameters

##### observerOrFn

[`Observer`](../type-aliases/Observer.md)\<`T`\> | (`value`) => `void`

#### Returns

[`Subscription`](../interfaces/Subscription.md)
