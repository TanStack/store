---
id: useSetValue
title: useSetValue
---

# Function: useSetValue()

## Call Signature

```ts
function useSetValue<TValue>(source): (fn) => void & (value) => void;
```

Defined in: react-store/src/useSetValue.ts:23

Returns a stable setter for a writable atom or store.

Writable atoms preserve their native `set` contract, supporting both direct
values and updater functions. Writable stores preserve their native
`setState` contract, supporting updater functions.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### source

`Atom`\<`TValue`\>

### Returns

(`fn`) => `void` & (`value`) => `void`

### Examples

```tsx
const setCount = useSetValue(countAtom)
setCount((prev) => prev + 1)
```

```tsx
const setState = useSetValue(appStore)
setState((prev) => ({ ...prev, count: prev.count + 1 }))
```

## Call Signature

```ts
function useSetValue<TValue>(source): (updater) => void;
```

Defined in: react-store/src/useSetValue.ts:24

Returns a stable setter for a writable atom or store.

Writable atoms preserve their native `set` contract, supporting both direct
values and updater functions. Writable stores preserve their native
`setState` contract, supporting updater functions.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### source

`Store`\<`TValue`\>

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

```tsx
const setCount = useSetValue(countAtom)
setCount((prev) => prev + 1)
```

```tsx
const setState = useSetValue(appStore)
setState((prev) => ({ ...prev, count: prev.count + 1 }))
```
