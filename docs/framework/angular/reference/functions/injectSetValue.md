---
id: injectSetValue
title: injectSetValue
---

# Function: injectSetValue()

## Call Signature

```ts
function injectSetValue<TValue>(source): (fn) => void & (value) => void;
```

Defined in: [packages/angular-store/src/index.ts:162](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L162)

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
readonly setCount = injectSetValue(countAtom)

increment() {
  this.setCount((prev) => prev + 1)
}
```

```ts
readonly setState = injectSetValue(counterStore)
```

## Call Signature

```ts
function injectSetValue<TValue, TActions>(source): (updater) => void;
```

Defined in: [packages/angular-store/src/index.ts:165](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L165)

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
readonly setCount = injectSetValue(countAtom)

increment() {
  this.setCount((prev) => prev + 1)
}
```

```ts
readonly setState = injectSetValue(counterStore)
```
