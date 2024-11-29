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

[derived.ts:52](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L52)

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

[derived.ts:56](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L56)

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

[derived.ts:51](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L51)

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

[derived.ts:42](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L42)

***

### onUpdate()?

```ts
optional onUpdate: () => void;
```

#### Returns

`void`

#### Defined in

[derived.ts:46](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L46)
