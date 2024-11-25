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

[derived.ts:15](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L15)

***

### fn()

```ts
fn: (props) => TState;
```

Values of the `deps` from before and after the current invocation of `fn`

#### Parameters

• **props**

• **props.currentVals**: `any`[]

• **props.prevVals**: `undefined` \| `any`[]

#### Returns

`TState`

#### Todo

Improve the typings to match `deps` from above

#### Defined in

[derived.ts:21](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L21)

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

[derived.ts:14](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L14)

***

### onSubscribe()?

```ts
optional onSubscribe: (listener, derived) => () => void;
```

#### Parameters

• **listener**: `Listener`\<`TState`\>

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

[derived.ts:9](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L9)
