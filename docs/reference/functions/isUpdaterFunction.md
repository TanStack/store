---
id: isUpdaterFunction
title: isUpdaterFunction
---

# Function: isUpdaterFunction()

```ts
function isUpdaterFunction<T>(updater): updater is (prev: T) => T;
```

Defined in: [types.ts:27](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L27)

Type guard to check if updater is a function

## Type Parameters

### T

`T`

## Parameters

### updater

[`Updater`](../type-aliases/Updater.md)\<`T`\>

## Returns

`updater is (prev: T) => T`
