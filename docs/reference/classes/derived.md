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

[derived.ts:87](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L87)

## Properties

### options

```ts
options: DerivedOptions<TState, TArr>;
```

#### Defined in

[derived.ts:64](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L64)

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

[derived.ts:109](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L109)

***

### state

#### Get Signature

```ts
get state(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:101](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L101)

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

[derived.ts:72](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L72)

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

[derived.ts:172](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L172)

***

### recompute()

```ts
recompute(): void
```

#### Returns

`void`

#### Defined in

[derived.ts:161](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L161)

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

[derived.ts:113](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L113)

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

[derived.ts:183](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L183)

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

[derived.ts:141](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L141)
