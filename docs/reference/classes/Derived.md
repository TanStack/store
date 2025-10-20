---
id: Derived
title: Derived
---

# Class: Derived\<TState, TArr\>

Defined in: [derived.ts:61](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L61)

## Type Parameters

### TState

`TState`

### TArr

`TArr` *extends* `ReadonlyArray`\<`Derived`\<`any`\> \| [`Store`](../Store.md)\<`any`\>\> = `ReadonlyArray`\<`any`\>

## Constructors

### Constructor

```ts
new Derived<TState, TArr>(options): Derived<TState, TArr>;
```

Defined in: [derived.ts:96](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L96)

#### Parameters

##### options

[`DerivedOptions`](../../interfaces/DerivedOptions.md)\<`TState`, `TArr`\>

#### Returns

`Derived`\<`TState`, `TArr`\>

## Properties

### lastSeenDepValues

```ts
lastSeenDepValues: unknown[] = [];
```

Defined in: [derived.ts:78](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L78)

***

### listeners

```ts
listeners: Set<Listener<TState>>;
```

Defined in: [derived.ts:67](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L67)

***

### options

```ts
options: DerivedOptions<TState, TArr>;
```

Defined in: [derived.ts:70](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L70)

***

### prevState

```ts
prevState: TState | undefined;
```

Defined in: [derived.ts:69](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L69)

***

### state

```ts
state: TState;
```

Defined in: [derived.ts:68](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L68)

## Methods

### checkIfRecalculationNeededDeeply()

```ts
checkIfRecalculationNeededDeeply(): void;
```

Defined in: [derived.ts:178](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L178)

#### Returns

`void`

***

### getDepVals()

```ts
getDepVals(): object;
```

Defined in: [derived.ts:79](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L79)

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
prevVal: NonNullable<TState> | undefined;
```

***

### mount()

```ts
mount(): () => void;
```

Defined in: [derived.ts:199](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L199)

#### Returns

```ts
(): void;
```

##### Returns

`void`

***

### recompute()

```ts
recompute(): void;
```

Defined in: [derived.ts:170](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L170)

#### Returns

`void`

***

### registerOnGraph()

```ts
registerOnGraph(deps): void;
```

Defined in: [derived.ts:105](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L105)

#### Parameters

##### deps

readonly (
  \| `Derived`\<`any`, readonly `any`[]\>
  \| [`Store`](../Store.md)\<`any`, (`cb`) => `any`\>)[] = `...`

#### Returns

`void`

***

### subscribe()

```ts
subscribe(listener): () => void;
```

Defined in: [derived.ts:211](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L211)

#### Parameters

##### listener

`Listener`\<`TState`\>

#### Returns

```ts
(): void;
```

##### Returns

`void`

***

### unregisterFromGraph()

```ts
unregisterFromGraph(deps): void;
```

Defined in: [derived.ts:147](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L147)

#### Parameters

##### deps

readonly (
  \| `Derived`\<`any`, readonly `any`[]\>
  \| [`Store`](../Store.md)\<`any`, (`cb`) => `any`\>)[] = `...`

#### Returns

`void`
