---
id: toObserver
title: toObserver
---

# Function: toObserver()

```ts
function toObserver<T>(
   nextHandler?, 
   errorHandler?, 
completionHandler?): Observer<T>;
```

Defined in: [atom.ts:12](https://github.com/TanStack/store/blob/main/packages/store/src/atom.ts#L12)

## Type Parameters

### T

`T`

## Parameters

### nextHandler?

[`Observer`](../type-aliases/Observer.md)\<`T`\> | (`value`) => `void`

### errorHandler?

(`error`) => `void`

### completionHandler?

() => `void`

## Returns

[`Observer`](../type-aliases/Observer.md)\<`T`\>
