---
id: useStore
title: useStore
---

# Function: useStore()

```ts
function useStore<TState, TSelected, TUpdater>(store, selector): TSelected
```

## Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

• **TUpdater** *extends* `AnyUpdater` = `AnyUpdater`

## Parameters

• **store**: `Store`\<`TState`, `TUpdater`\>

• **selector** = `...`

## Returns

`TSelected`

## Defined in

[index.ts:11](https://github.com/TanStack/store/blob/main/packages/react-store/src/index.ts#L11)
