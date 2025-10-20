---
id: StoreOptions
title: StoreOptions
---

# Interface: StoreOptions\<TState, TUpdater\>

Defined in: [store.ts:5](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L5)

## Type Parameters

### TState

`TState`

### TUpdater

`TUpdater` *extends* `AnyUpdater` = (`cb`) => `TState`

## Properties

### onSubscribe()?

```ts
optional onSubscribe: (listener, store) => () => void;
```

Defined in: [store.ts:18](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L18)

Called when a listener subscribes to the store.

#### Parameters

##### listener

`Listener`\<`TState`\>

##### store

[`Store`](../../classes/Store.md)\<`TState`, `TUpdater`\>

#### Returns

a function to unsubscribe the listener

```ts
(): void;
```

##### Returns

`void`

***

### onUpdate()?

```ts
optional onUpdate: () => void;
```

Defined in: [store.ts:25](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L25)

Called after the state has been updated, used to derive other state.

#### Returns

`void`

***

### updateFn()?

```ts
optional updateFn: (previous) => (updater) => TState;
```

Defined in: [store.ts:12](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L12)

Replace the default update function with a custom one.

#### Parameters

##### previous

`TState`

#### Returns

```ts
(updater): TState;
```

##### Parameters

###### updater

`TUpdater`

##### Returns

`TState`
