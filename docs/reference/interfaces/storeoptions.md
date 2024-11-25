---
id: StoreOptions
title: StoreOptions
---

# Interface: StoreOptions\<TState, TUpdater\>

## Type Parameters

• **TState**

• **TUpdater** *extends* `AnyUpdater` = (`cb`) => `TState`

## Properties

### onSubscribe()?

```ts
optional onSubscribe: (listener, store) => () => void;
```

Called when a listener subscribes to the store.

#### Parameters

• **listener**: `Listener`

• **store**: [`Store`](../classes/store.md)\<`TState`, `TUpdater`\>

#### Returns

`Function`

a function to unsubscribe the listener

##### Returns

`void`

#### Defined in

[store.ts:16](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L16)

***

### onUpdate()?

```ts
optional onUpdate: () => void;
```

Called after the state has been updated, used to derive other state.

#### Returns

`void`

#### Defined in

[store.ts:23](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L23)

***

### updateFn()?

```ts
optional updateFn: (previous) => (updater) => TState;
```

Replace the default update function with a custom one.

#### Parameters

• **previous**: `TState`

#### Returns

`Function`

##### Parameters

• **updater**: `TUpdater`

##### Returns

`TState`

#### Defined in

[store.ts:10](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L10)
