---
id: ReadonlyStore
title: ReadonlyStore
---

# Class: ReadonlyStore\<T\>

Defined in: [store.ts:31](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L31)

## Type Parameters

### T

`T`

## Implements

- `Omit`\<[`Store`](Store.md)\<`T`\>, `"setState"`\>

## Constructors

### Constructor

```ts
new ReadonlyStore<T>(getValue): ReadonlyStore<T>;
```

Defined in: [store.ts:33](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L33)

#### Parameters

##### getValue

(`prev?`) => `T`

#### Returns

`ReadonlyStore`\<`T`\>

### Constructor

```ts
new ReadonlyStore<T>(initialValue): ReadonlyStore<T>;
```

Defined in: [store.ts:34](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L34)

#### Parameters

##### initialValue

`T`

#### Returns

`ReadonlyStore`\<`T`\>

## Accessors

### state

#### Get Signature

```ts
get state(): T;
```

Defined in: [store.ts:42](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L42)

##### Returns

`T`

#### Implementation of

```ts
Omit.state
```

## Methods

### get()

```ts
get(): T;
```

Defined in: [store.ts:45](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L45)

#### Returns

`T`

#### Implementation of

```ts
Omit.get
```

***

### subscribe()

```ts
subscribe(observerOrFn): Subscription;
```

Defined in: [store.ts:48](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L48)

#### Parameters

##### observerOrFn

[`Observer`](../type-aliases/Observer.md)\<`T`\> | (`value`) => `void`

#### Returns

[`Subscription`](../interfaces/Subscription.md)

#### Implementation of

```ts
Omit.subscribe
```
