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

[derived.ts:23](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L23)

***

### fn()

```ts
fn: (props) => TState;
```

Values of the `deps` from before and after the current invocation of `fn`

#### Parameters

• **props**: [`DerivedFnProps`](derivedfnprops.md)\<`TState`\>

#### Returns

`TState`

#### Todo

Improve the typings to match `deps` from above

#### Defined in

[derived.ts:29](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L29)

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

[derived.ts:22](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L22)

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

[derived.ts:13](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L13)

***

### onUpdate()?

```ts
optional onUpdate: () => void;
```

#### Returns

`void`

#### Defined in

[derived.ts:17](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L17)
