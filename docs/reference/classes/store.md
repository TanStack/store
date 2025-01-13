---
id: Store
title: Store
---

# Class: Store\<TState, TUpdater\>

Defined in: [store.ts:27](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L27)

## Type Parameters

• **TState**

• **TUpdater** *extends* `AnyUpdater` = (`cb`) => `TState`

## Constructors

### new Store()

```ts
new Store<TState, TUpdater>(initialState, options?): Store<TState, TUpdater>
```

Defined in: [store.ts:36](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L36)

#### Parameters

##### initialState

`TState`

##### options?

[`StoreOptions`](../interfaces/storeoptions.md)\<`TState`, `TUpdater`\>

#### Returns

[`Store`](store.md)\<`TState`, `TUpdater`\>

## Properties

### listeners

```ts
listeners: Set<Listener<TState>>;
```

Defined in: [store.ts:31](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L31)

***

### options?

```ts
optional options: StoreOptions<TState, TUpdater>;
```

Defined in: [store.ts:34](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L34)

***

### prevState

```ts
prevState: TState;
```

Defined in: [store.ts:33](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L33)

***

### state

```ts
state: TState;
```

Defined in: [store.ts:32](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L32)

## Methods

### setState()

```ts
setState(updater): void
```

Defined in: [store.ts:51](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L51)

#### Parameters

##### updater

`TUpdater`

#### Returns

`void`

***

### subscribe()

```ts
subscribe(listener): () => void
```

Defined in: [store.ts:42](https://github.com/TanStack/store/blob/main/packages/store/src/store.ts#L42)

#### Parameters

##### listener

`Listener`\<`TState`\>

#### Returns

`Function`

##### Returns

`void`
