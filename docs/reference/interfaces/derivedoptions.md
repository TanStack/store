---
id: DerivedOptions
title: DerivedOptions
---

# Interface: DerivedOptions\<TState, TArr\>

## Type Parameters

• **TState**

• **TArr** *extends* `ReadonlyArray`\<[`Derived`](../classes/derived.md)\<`any`\> \| [`Store`](../classes/store.md)\<`any`\>\> = `ReadonlyArray`\<`any`\>

## Properties

### deps

```ts
deps: TArr;
```

#### Defined in

[derived.ts:51](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L51)

***

### fn()

```ts
fn: (props) => TState;
```

Values of the `deps` from before and after the current invocation of `fn`

#### Parameters

• **props**: [`DerivedFnProps`](derivedfnprops.md)\<`TArr`, `UnwrapReadonlyDerivedOrStoreArray`\<`TArr`\>\>

#### Returns

`TState`

#### Defined in

[derived.ts:55](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L55)

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

[derived.ts:50](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L50)

***

### onSubscribe()?

```ts
optional onSubscribe: (listener, derived) => () => void;
```

#### Parameters

• **listener**: `Listener`\<`TState`\>

• **derived**: [`Derived`](../classes/derived.md)\<`TState`, readonly `any`[]\>

#### Returns

`Function`

##### Returns

`void`

#### Defined in

[derived.ts:41](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L41)

***

### onUpdate()?

```ts
optional onUpdate: () => void;
```

#### Returns

`void`

#### Defined in

[derived.ts:45](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L45)
