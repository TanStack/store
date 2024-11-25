---
id: Derived
title: Derived
---

# Class: Derived\<TState\>

## Type Parameters

• **TState**

## Constructors

### new Derived()

```ts
new Derived<TState>(options): Derived<TState>
```

#### Parameters

• **options**: [`DerivedOptions`](../interfaces/derivedoptions.md)\<`TState`\>

#### Returns

[`Derived`](derived.md)\<`TState`\>

#### Defined in

[derived.ts:57](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L57)

## Properties

### derivedToStore

```ts
derivedToStore: Map<Derived<unknown>, Set<Store<unknown, (cb) => unknown>>>;
```

#### Defined in

[derived.ts:55](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L55)

***

### options

```ts
options: DerivedOptions<TState>;
```

#### Defined in

[derived.ts:25](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L25)

***

### storeToDerived

```ts
storeToDerived: Map<Store<unknown, (cb) => unknown>, Set<Derived<unknown>>>;
```

This is here to solve the pyramid dependency problem where:
      A
     / \
    B   C
     \ /
      D

Where we deeply traverse this tree, how do we avoid D being recomputed twice; once when B is updated, once when C is.

To solve this, we create linkedDeps that allows us to sync avoid writes to the state until all of the deps have been
resolved.

This is a record of stores, because derived stores are not able to write values to, but stores are

#### Defined in

[derived.ts:54](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L54)

## Accessors

### state

#### Get Signature

```ts
get state(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:89](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L89)

## Methods

### mount()

```ts
mount(): () => void
```

#### Returns

`Function`

##### Returns

`void`

#### Defined in

[derived.ts:98](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L98)

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

[derived.ts:139](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L139)
