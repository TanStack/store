---
id: useSelector
title: useSelector
---

# Function: useSelector()

```ts
function useSelector<TState, TSelected>(
   source, 
   selector, 
   options): object;
```

Defined in: [svelte-store/src/index.svelte.ts:36](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/index.svelte.ts#L36)

Selects a slice of state from an atom or store and exposes it through a
rune-friendly holder object.

Read the selected value from `.current`.

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

### options

[`UseSelectorOptions`](../interfaces/UseSelectorOptions.md)\<`TSelected`\> = `{}`

## Returns

`object`

### current

```ts
readonly current: TSelected;
```

## Examples

```ts
const count = useSelector(counterStore, (state) => state.count)
console.log(count.current)
```

```ts
const doubled = useSelector(countAtom, (value) => value * 2)
```
