---
id: DerivedOptions
title: DerivedOptions
---

# Interface: DerivedOptions\<TState, TArr\>

Defined in: [derived.ts:38](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L38)

## Type Parameters

• **TState**

• **TArr** *extends* `ReadonlyArray`\<
  \| [`Derived`](../classes/derived.md)\<`any`\>
  \| [`Store`](../classes/store.md)\<`any`\>\> = `ReadonlyArray`\<`any`\>

## Properties

### deps

```ts
deps: TArr;
```

Defined in: [derived.ts:47](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L47)

***

### fn()

```ts
fn: (props) => TState;
```

Defined in: [derived.ts:51](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L51)

Values of the `deps` from before and after the current invocation of `fn`

#### Parameters

##### props

[`DerivedFnProps`](derivedfnprops.md)\<`TArr`, `UnwrapReadonlyDerivedOrStoreArray`\<`TArr`\>\>

#### Returns

`TState`

***

### onSubscribe()?

```ts
optional onSubscribe: (listener, derived) => () => void;
```

Defined in: [derived.ts:42](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L42)

#### Parameters

##### listener

`Listener`\<`TState`\>

##### derived

[`Derived`](../classes/derived.md)\<`TState`\>

#### Returns

`Function`

##### Returns

`void`

***

### onUpdate()?

```ts
optional onUpdate: () => void;
```

Defined in: [derived.ts:46](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L46)

#### Returns

`void`
