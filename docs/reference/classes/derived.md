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

##### options

[`DerivedOptions`](../interfaces/derivedoptions.md)\<`TState`, `TArr`\>

#### Returns

[`Derived`](derived.md)\<`TState`, `TArr`\>

#### Defined in

[derived.ts:87](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L87)

## Properties

### lastSeenDepValues

```ts
lastSeenDepValues: unknown[] = [];
```

#### Defined in

[derived.ts:71](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L71)

***

### listeners

```ts
listeners: Set<Listener<TState>>;
```

#### Defined in

[derived.ts:60](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L60)

***

### options

```ts
options: DerivedOptions<TState, TArr>;
```

#### Defined in

[derived.ts:63](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L63)

***

### prevState

```ts
prevState: undefined | TState;
```

#### Defined in

[derived.ts:62](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L62)

***

### state

```ts
state: TState;
```

#### Defined in

[derived.ts:61](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L61)

## Methods

### checkIfRecalculationNeededDeeply()

```ts
checkIfRecalculationNeededDeeply(): void
```

#### Returns

`void`

#### Defined in

[derived.ts:157](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L157)

***

### getDepVals()

```ts
getDepVals(): object
```

#### Returns

`object`

##### currDepVals

```ts
currDepVals: unknown[];
```

##### prevDepVals

```ts
prevDepVals: unknown[];
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

[derived.ts:178](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L178)

***

### recompute()

```ts
recompute(): void
```

#### Returns

`void`

#### Defined in

[derived.ts:145](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L145)

***

### registerOnGraph()

```ts
registerOnGraph(deps): void
```

#### Parameters

##### deps

readonly ([`Derived`](derived.md)\<`any`, readonly `any`[]\> \| [`Store`](store.md)\<`any`, (`cb`) => `any`\>)[] = `...`

#### Returns

`void`

#### Defined in

[derived.ts:96](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L96)

***

### subscribe()

```ts
subscribe(listener): () => void
```

#### Parameters

##### listener

`Listener`\<`TState`\>

#### Returns

`Function`

##### Returns

`void`

#### Defined in

[derived.ts:190](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L190)

***

### unregisterFromGraph()

```ts
unregisterFromGraph(deps): void
```

#### Parameters

##### deps

readonly ([`Derived`](derived.md)\<`any`, readonly `any`[]\> \| [`Store`](store.md)\<`any`, (`cb`) => `any`\>)[] = `...`

#### Returns

`void`

#### Defined in

[derived.ts:125](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L125)
