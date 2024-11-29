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

[derived.ts:92](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L92)

## Properties

### hasBeenRead

```ts
hasBeenRead: boolean = false;
```

#### Defined in

[derived.ts:108](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L108)

***

### options

```ts
options: DerivedOptions<TState, TArr>;
```

#### Defined in

[derived.ts:69](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L69)

## Accessors

### prevState

#### Get Signature

```ts
get prevState(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:120](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L120)

***

### state

#### Get Signature

```ts
get state(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:110](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L110)

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

[derived.ts:77](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L77)

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

[derived.ts:186](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L186)

***

### recompute()

```ts
recompute(): void
```

#### Returns

`void`

#### Defined in

[derived.ts:172](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L172)

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

[derived.ts:124](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L124)

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

[derived.ts:197](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L197)

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

[derived.ts:152](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L152)
