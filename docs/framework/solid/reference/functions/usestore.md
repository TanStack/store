---
id: useStore
title: useStore
---

# Function: useStore()

```ts
function useStore<TState, TSelected, TUpdater>(store, selector): Accessor<TSelected>
```

## Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

• **TUpdater** *extends* `AnyUpdater` = `AnyUpdater`

## Parameters

### store

`Store`\<`TState`, `TUpdater`\>

### selector

(`state`) => `TSelected`

## Returns

`Accessor`\<`TSelected`\>

## Defined in

[index.tsx:13](https://github.com/TanStack/store/blob/main/packages/solid-store/src/index.tsx#L13)
