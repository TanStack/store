---
id: ReadonlyStore
title: ReadonlyStore
---

# Class: ReadonlyStore\<T\>

Defined in: [store.ts:57](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L57)

## Type Parameters

### T

`T`

## Implements

- `Omit`\<[`Store`](Store.md)\<`T`\>, `"setState"` \| `"actions"`\>

## Constructors

### Constructor

```ts
new ReadonlyStore<T>(getValue): ReadonlyStore<T>;
```

Defined in: [store.ts:62](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L62)

#### Parameters

##### getValue

(`prev?`) => `T`

#### Returns

`ReadonlyStore`\<`T`\>

### Constructor

```ts
new ReadonlyStore<T>(initialValue): ReadonlyStore<T>;
```

Defined in: [store.ts:63](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L63)

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

Defined in: [store.ts:71](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L71)

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

Defined in: [store.ts:74](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L74)

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

Defined in: [store.ts:77](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L77)

#### Parameters

##### observerOrFn

[`Observer`](../type-aliases/Observer.md)\<`T`\> | (`value`) => `void`

#### Returns

[`Subscription`](../interfaces/Subscription.md)

#### Implementation of

```ts
Omit.subscribe
```
