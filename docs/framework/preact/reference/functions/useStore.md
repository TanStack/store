---
id: useStore
title: useStore
---

# Function: useStore()

```ts
function useStore<TState, TSelected>(
   store, 
   selector, 
   options): TSelected;
```

Defined in: [index.ts:105](https://github.com/TanStack/store/blob/main/packages/preact-store/src/index.ts#L105)

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

`TSelected`
