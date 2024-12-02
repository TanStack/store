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

[derived.ts:95](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L95)

## Properties

### options

```ts
options: DerivedOptions<TState, TArr>;
```

#### Defined in

[derived.ts:72](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L72)

## Accessors

### prevState

#### Get Signature

```ts
get prevState(): TState
```

##### Returns

`TState`

#### Set Signature

```ts
set prevState(val): void
```

##### Parameters

• **val**: `TState`

##### Returns

`void`

#### Defined in

[derived.ts:117](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L117)

***

### state

#### Get Signature

```ts
get state(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:109](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L109)

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

[derived.ts:80](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L80)

***

### mount()

```ts
mount(__namedParameters): () => void
```

#### Parameters

• **\_\_namedParameters**: [`DerivedMountOptions`](../interfaces/derivedmountoptions.md) = `{}`

#### Returns

`Function`

##### Returns

`void`

#### Defined in

[derived.ts:181](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L181)

***

### recompute()

```ts
recompute(): void
```

#### Returns

`void`

#### Defined in

[derived.ts:170](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L170)

***

### registerOnGraph()

```ts
registerOnGraph(deps): void
```

#### Parameters

• **deps**: readonly ([`Derived`](derived.md)\<`any`, readonly `any`[]\> \| [`Store`](store.md)\<`any`, (`cb`) => `any`\>)[] = `...`

#### Returns

`void`

#### Defined in

[derived.ts:121](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L121)

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

[derived.ts:195](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L195)

***

### unregisterFromGraph()

```ts
unregisterFromGraph(deps): void
```

#### Parameters

• **deps**: readonly ([`Derived`](derived.md)\<`any`, readonly `any`[]\> \| [`Store`](store.md)\<`any`, (`cb`) => `any`\>)[] = `...`

#### Returns

`void`

#### Defined in

[derived.ts:150](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L150)
