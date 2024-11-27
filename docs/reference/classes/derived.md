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

[derived.ts:87](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L87)

## Properties

### derivedToStore

```ts
derivedToStore: Map<Derived<unknown>, Set<Store<unknown, (cb) => unknown>>>;
```

#### Defined in

[derived.ts:71](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L71)

***

### options

```ts
options: DerivedOptions<TState>;
```

#### Defined in

[derived.ts:41](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L41)

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

[derived.ts:70](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L70)

## Accessors

### prevState

#### Get Signature

```ts
get prevState(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:133](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L133)

***

### state

#### Get Signature

```ts
get state(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:124](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L124)

## Methods

### getDepVals()

```ts
getDepVals(): DerivedFnProps<TState>
```

#### Returns

[`DerivedFnProps`](../interfaces/derivedfnprops.md)\<`TState`\>

#### Defined in

[derived.ts:73](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L73)

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

[derived.ts:137](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L137)

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

[derived.ts:178](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L178)
