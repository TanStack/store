---
id: useStore
title: useStore
---

# Function: useStore()

```ts
function useStore<TState, TSelected>(
   store, 
   selector, 
options): Accessor<TSelected>;
```

Defined in: [index.tsx:12](https://github.com/TanStack/store/blob/main/packages/solid-store/src/index.tsx#L12)

## Type Parameters

### TState

`TState`

### TSelected

`TSelected` = `NoInfer`\<`TState`\>

## Parameters

### store

`Atom`\<`TState`\> | `ReadonlyAtom`\<`TState`\>

### selector

(`state`) => `TSelected`

### options

`UseStoreOptions`\<`TSelected`\> = `{}`

## Returns

`Accessor`\<`TSelected`\>
