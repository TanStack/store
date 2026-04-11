---
id: ReadonlyStore
title: ReadonlyStore
---

# Class: ReadonlyStore\<T\>

Defined in: [store.ts:61](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L61)

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

Defined in: [store.ts:66](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L66)

#### Parameters

##### getValue

(`prev?`) => `T`

#### Returns

`ReadonlyStore`\<`T`\>

### Constructor

```ts
new ReadonlyStore<T>(initialValue): ReadonlyStore<T>;
```

Defined in: [store.ts:67](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L67)

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

Defined in: [store.ts:75](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L75)

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

Defined in: [store.ts:78](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L78)

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

Defined in: [store.ts:81](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L81)

#### Parameters

##### observerOrFn

[`Observer`](../type-aliases/Observer.md)\<`T`\> | (`value`) => `void`

#### Returns

[`Subscription`](../interfaces/Subscription.md)

#### Implementation of

```ts
Omit.subscribe
```
