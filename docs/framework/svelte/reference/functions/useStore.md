---
id: useStore
title: useStore
---

# Function: useStore()

```ts
function useStore<TState, TSelected>(
   store, 
   selector, 
   options): object;
```

Defined in: [index.svelte.ts:14](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/index.svelte.ts#L14)

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

`object`

### current

```ts
readonly current: TSelected;
```
