---
id: DerivedOptions
title: DerivedOptions
---

# Interface: DerivedOptions\<TState\>

## Type Parameters

• **TState**

## Properties

### deps

```ts
deps: (Derived<any> | Store<any, (cb) => any>)[];
```

#### Defined in

[derived.ts:12](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L12)

***

### fn()

```ts
fn: () => TState;
```

#### Returns

`TState`

#### Defined in

[derived.ts:13](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L13)

***

### lazy?

```ts
optional lazy: boolean;
```

Should the value of `Derived` only be computed once it is accessed

#### Default

```ts
false
```

#### Defined in

[derived.ts:11](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L11)

***

### onSubscribe()?

```ts
optional onSubscribe: (listener, derived) => () => void;
```

#### Parameters

• **listener**: `Listener`

• **derived**: [`Derived`](../classes/derived.md)\<`TState`\>

#### Returns

`Function`

##### Returns

`void`

#### Defined in

[derived.ts:5](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L5)

***

### onUpdate()?

```ts
optional onUpdate: () => void;
```

#### Returns

`void`

#### Defined in

[derived.ts:6](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L6)
