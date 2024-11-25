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

[store.ts:42](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L42)

## Properties

### listeners

```ts
listeners: Set<Listener>;
```

#### Defined in

[store.ts:30](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L30)

***

### options?

```ts
optional options: StoreOptions<TState, TUpdater>;
```

#### Defined in

[store.ts:32](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L32)

***

### state

```ts
state: TState;
```

#### Defined in

[store.ts:31](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L31)

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

[store.ts:81](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L81)

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

[store.ts:56](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L56)

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

[store.ts:47](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L47)
