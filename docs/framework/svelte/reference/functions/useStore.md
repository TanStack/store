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

Defined in: [index.svelte.ts:10](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/index.svelte.ts#L10)

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
