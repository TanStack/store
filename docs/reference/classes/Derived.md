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

Defined in: [derived.ts:95](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L95)

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

Defined in: [derived.ts:77](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L77)

***

### listeners

```ts
listeners: Set<Listener<TState>>;
```

Defined in: [derived.ts:66](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L66)

***

### options

```ts
options: DerivedOptions<TState, TArr>;
```

Defined in: [derived.ts:69](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L69)

***

### prevState

```ts
prevState: TState | undefined;
```

Defined in: [derived.ts:68](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L68)

***

### state

```ts
state: TState;
```

Defined in: [derived.ts:67](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L67)

## Methods

### checkIfRecalculationNeededDeeply()

```ts
checkIfRecalculationNeededDeeply(): void;
```

Defined in: [derived.ts:177](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L177)

#### Returns

`void`

***

### getDepVals()

```ts
getDepVals(): object;
```

Defined in: [derived.ts:78](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L78)

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

Defined in: [derived.ts:198](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L198)

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

Defined in: [derived.ts:169](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L169)

#### Returns

`void`

***

### registerOnGraph()

```ts
registerOnGraph(deps): void;
```

Defined in: [derived.ts:104](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L104)

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

Defined in: [derived.ts:210](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L210)

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

Defined in: [derived.ts:146](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L146)

#### Parameters

##### deps

readonly (
  \| `Derived`\<`any`, readonly `any`[]\>
  \| [`Store`](../Store.md)\<`any`, (`cb`) => `any`\>)[] = `...`

#### Returns

`void`
