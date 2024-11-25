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

[derived.ts:39](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L39)

## Properties

### options

```ts
options: DerivedOptions<TState>;
```

#### Defined in

[derived.ts:25](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L25)

## Accessors

### state

#### Get Signature

```ts
get state(): TState
```

##### Returns

`TState`

#### Defined in

[derived.ts:121](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L121)

## Methods

### cleanup()

```ts
cleanup(): void
```

#### Returns

`void`

#### Defined in

[derived.ts:130](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L130)

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

[derived.ts:140](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L140)
