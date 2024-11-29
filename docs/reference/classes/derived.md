---
id: Derived
title: Derived
---

# Class: Derived\<TState, TArr\>

## Type Parameters

• **TState**

• **TArr** *extends* `ReadonlyArray`\<[`Derived`](derived.md)\<`any`\> \| [`Store`](store.md)\<`any`\>\> = `ReadonlyArray`\<`any`\>

## Constructors

### new Derived()

```ts
new Derived<TState, TArr>(options): Derived<TState, TArr>
```

#### Parameters

• **options**: [`DerivedOptions`](../interfaces/derivedoptions.md)\<`TState`, `TArr`\>

#### Returns

[`Derived`](derived.md)\<`TState`, `TArr`\>

#### Defined in

[derived.ts:117](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L117)

## Properties

### derivedToStore

```ts
derivedToStore: Map<Derived<unknown, readonly any[]>, Set<Store<unknown, (cb) => unknown>>>;
```

#### Defined in

[derived.ts:100](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L100)

***

### options

```ts
options: DerivedOptions<TState, TArr>;
```

#### Defined in

[derived.ts:70](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L70)

***

### storeToDerived

```ts
storeToDerived: Map<Store<unknown, (cb) => unknown>, Set<Derived<unknown, readonly any[]>>>;
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

[derived.ts:99](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L99)

## Accessors

### prevState

#### Get Signature

```ts
get prevState(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:163](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L163)

***

### state

#### Get Signature

```ts
get state(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:154](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L154)

## Methods

### getDepVals()

```ts
getDepVals(): object
```

#### Returns

`object`

##### currDepVals

```ts
currDepVals: never;
```

##### prevDepVals

```ts
prevDepVals: never;
```

##### prevVal

```ts
prevVal: undefined | NonNullable<TState>;
```

#### Defined in

[derived.ts:102](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L102)

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

[derived.ts:167](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L167)

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

[derived.ts:210](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L210)
