---
id: injectSelector
title: injectSelector
---

# Function: injectSelector()

```ts
function injectSelector<TState, TSelected>(
   source, 
   selector, 
options?): Signal<TSelected>;
```

Defined in: [packages/angular-store/src/index.ts:107](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L107)

Selects a slice of state from an atom or store and returns it as an Angular
signal.

This is the primary Angular read hook for TanStack Store.

## Type Parameters

### TState

`TState`

### TSelected

`TSelected` = `NoInfer`\<`TState`\>

## Parameters

### source

`SelectionSource`\<`TState`\>

### selector

(`state`) => `TSelected`

### options?

[`InjectSelectorOptions`](../interfaces/InjectSelectorOptions.md)\<`TSelected`\>

## Returns

`Signal`\<`TSelected`\>

## Examples

```ts
readonly count = injectSelector(counterStore, (state) => state.count)
```

```ts
readonly doubled = injectSelector(countAtom, (value) => value * 2)
```
