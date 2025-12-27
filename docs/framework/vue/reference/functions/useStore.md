---
id: useStore
title: useStore
---

# Function: useStore()

```ts
function useStore<TState, TSelected>(
   store, 
   selector, 
options): Readonly<Ref<TSelected>>;
```

Defined in: [index.ts:16](https://github.com/TanStack/store/blob/main/packages/vue-store/src/index.ts#L16)

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

`Readonly`\<`Ref`\<`TSelected`\>\>
