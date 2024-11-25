---
id: Store
title: Store
---

# Class: Store\<TState, TUpdater\>

## Type Parameters

• **TState**

• **TUpdater** *extends* `AnyUpdater` = (`cb`) => `TState`

## Constructors

### new Store()

```ts
new Store<TState, TUpdater>(initialState, options?): Store<TState, TUpdater>
```

#### Parameters

• **initialState**: `TState`

• **options?**: [`StoreOptions`](../interfaces/storeoptions.md)\<`TState`, `TUpdater`\>

#### Returns

[`Store`](store.md)\<`TState`, `TUpdater`\>

#### Defined in

[index.ts:50](https://github.com/TanStack/store/blob/main/packages/store/src/index.ts#L50)

## Properties

### listeners

```ts
listeners: Set<Listener>;
```

#### Defined in

[index.ts:38](https://github.com/TanStack/store/blob/main/packages/store/src/index.ts#L38)

***

### options?

```ts
optional options: StoreOptions<TState, TUpdater>;
```

#### Defined in

[index.ts:40](https://github.com/TanStack/store/blob/main/packages/store/src/index.ts#L40)

***

### state

```ts
state: TState;
```

#### Defined in

[index.ts:39](https://github.com/TanStack/store/blob/main/packages/store/src/index.ts#L39)

## Methods

### batch()

```ts
batch(cb): void
```

#### Parameters

• **cb**

#### Returns

`void`

#### Defined in

[index.ts:89](https://github.com/TanStack/store/blob/main/packages/store/src/index.ts#L89)

***

### setState()

```ts
setState(updater): void
```

#### Parameters

• **updater**: `TUpdater`

#### Returns

`void`

#### Defined in

[index.ts:64](https://github.com/TanStack/store/blob/main/packages/store/src/index.ts#L64)

***

### subscribe()

```ts
subscribe(listener): () => void
```

#### Parameters

• **listener**: `Listener`

#### Returns

`Function`

##### Returns

`void`

#### Defined in

[index.ts:55](https://github.com/TanStack/store/blob/main/packages/store/src/index.ts#L55)
