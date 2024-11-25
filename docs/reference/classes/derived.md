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

[derived.ts:82](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L82)

## Properties

### derivedToStore

```ts
derivedToStore: Map<Derived<unknown>, Set<Store<unknown, (cb) => unknown>>>;
```

#### Defined in

[derived.ts:67](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L67)

***

### options

```ts
options: DerivedOptions<TState>;
```

#### Defined in

[derived.ts:37](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L37)

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

[derived.ts:66](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L66)

## Accessors

### prevState

#### Get Signature

```ts
get prevState(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:127](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L127)

***

### state

#### Get Signature

```ts
get state(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:118](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L118)

## Methods

### getDepVals()

```ts
getDepVals(): object
```

#### Returns

`object`

##### currentVals

```ts
currentVals: unknown[];
```

##### prevVals

```ts
prevVals: unknown[];
```

#### Defined in

[derived.ts:69](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L69)

***

### mount()

```ts
mount(): () => void
```

#### Returns

`Function`

##### Returns

`void`

#### Defined in

[derived.ts:131](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L131)

***

### subscribe()

```ts
subscribe(listener): () => void
```

#### Parameters

• **listener**: `Listener`\<`TState`\>

#### Returns

`Function`

##### Returns

`void`

#### Defined in

[derived.ts:172](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L172)
