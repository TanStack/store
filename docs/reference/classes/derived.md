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

[derived.ts:119](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L119)

## Properties

### derivedToStore

```ts
derivedToStore: Map<Derived<unknown, readonly any[]>, Set<Store<unknown, (cb) => unknown>>>;
```

#### Defined in

[derived.ts:102](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L102)

***

### options

```ts
options: DerivedOptions<TState, TArr>;
```

#### Defined in

[derived.ts:72](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L72)

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

[derived.ts:101](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L101)

## Accessors

### prevState

#### Get Signature

```ts
get prevState(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:165](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L165)

***

### state

#### Get Signature

```ts
get state(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:156](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L156)

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

[derived.ts:104](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L104)

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

[derived.ts:169](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L169)

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

[derived.ts:212](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L212)
