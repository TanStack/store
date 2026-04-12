---
id: useSetValue
title: useSetValue
---

# Function: useSetValue()

## Call Signature

```ts
function useSetValue<TValue>(source): (fn) => void & (value) => void;
```

Defined in: [vue-store/src/useSetValue.ts:21](https://github.com/TanStack/store/blob/main/packages/vue-store/src/useSetValue.ts#L21)

Returns a stable setter for a writable atom or store.

Writable atoms preserve their native `set` contract. Writable stores
preserve their native `setState` contract.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### source

`Atom`\<`TValue`\>

### Returns

(`fn`) => `void` & (`value`) => `void`

### Examples

```ts
const setCount = useSetValue(countAtom)
setCount((prev) => prev + 1)
```

```ts
const setState = useSetValue(counterStore)
setState((state) => ({ ...state, count: state.count + 1 }))
```

## Call Signature

```ts
function useSetValue<TValue, TActions>(source): (updater) => void;
```

Defined in: [vue-store/src/useSetValue.ts:22](https://github.com/TanStack/store/blob/main/packages/vue-store/src/useSetValue.ts#L22)

Returns a stable setter for a writable atom or store.

Writable atoms preserve their native `set` contract. Writable stores
preserve their native `setState` contract.

### Type Parameters

#### TValue

`TValue`

#### TActions

`TActions` *extends* `StoreActionMap`

### Parameters

#### source

`Store`\<`TValue`, `TActions`\>

### Returns

```ts
(updater): void;
```

#### Parameters

##### updater

(`prev`) => `TValue`

#### Returns

`void`

### Examples

```ts
const setCount = useSetValue(countAtom)
setCount((prev) => prev + 1)
```

```ts
const setState = useSetValue(counterStore)
setState((state) => ({ ...state, count: state.count + 1 }))
```
