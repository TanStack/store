---
id: StoreOptions
title: StoreOptions
---

# Interface: StoreOptions\<TState, TUpdater\>

Defined in: [store.ts:4](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L4)

## Type Parameters

• **TState**

• **TUpdater** *extends* `AnyUpdater` = (`cb`) => `TState`

## Properties

### onSubscribe()?

```ts
optional onSubscribe: (listener, store) => () => void;
```

Defined in: [store.ts:17](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L17)

Called when a listener subscribes to the store.

#### Parameters

##### listener

`Listener`\<`TState`\>

##### store

[`Store`](../classes/store.md)\<`TState`, `TUpdater`\>

#### Returns

`Function`

a function to unsubscribe the listener

##### Returns

`void`

***

### onUpdate()?

```ts
optional onUpdate: () => void;
```

Defined in: [store.ts:24](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L24)

Called after the state has been updated, used to derive other state.

#### Returns

`void`

***

### updateFn()?

```ts
optional updateFn: (previous) => (updater) => TState;
```

Defined in: [store.ts:11](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L11)

Replace the default update function with a custom one.

#### Parameters

##### previous

`TState`

#### Returns

`Function`

##### Parameters

###### updater

`TUpdater`

##### Returns

`TState`
