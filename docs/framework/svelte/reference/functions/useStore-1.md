---
id: useStore
title: useStore
---

# ~~Function: useStore()~~

```ts
function useStore<TState, TSelected>(
   source, 
   selector, 
   compare?): object;
```

Defined in: [svelte-store/src/useStore.ts:15](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/useStore.ts#L15)

Deprecated alias for [useSelector](useSelector.md).

## Type Parameters

### TState

`TState`

### TSelected

`TSelected` = `NoInfer`\<`TState`\>

## Parameters

### source

`Atom`\<`TState`\> | `ReadonlyAtom`\<`TState`\> | `Store`\<`TState`, `any`\> | `ReadonlyStore`\<`TState`\>

### selector

(`state`) => `TSelected`

### compare?

(`a`, `b`) => `boolean`

## Returns

`object`

### ~~current~~

```ts
readonly current: TSelected;
```

## Example

```ts
const count = useStore(counterStore, (state) => state.count)
console.log(count.current)
```

## Deprecated

Use `useSelector` instead.
