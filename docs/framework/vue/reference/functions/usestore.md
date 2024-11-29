---
id: useStore
title: useStore
---

# Function: useStore()

```ts
function useStore<TState, TSelected, TUpdater>(store, selector): Readonly<Ref<TSelected>>
```

## Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

• **TUpdater** *extends* `AnyUpdater` = `AnyUpdater`

## Parameters

• **store**: `Store`\<`TState`, `TUpdater`\>

• **selector** = `...`

## Returns

`Readonly`\<`Ref`\<`TSelected`\>\>

## Defined in

[index.ts:12](https://github.com/TanStack/store/blob/main/packages/vue-store/src/index.ts#L12)
