---
id: _useStore
title: _useStore
---

# Function: \_useStore()

```ts
function _useStore<TState, TActions, TSelected>(
   store, 
   selector, 
   options?): [Readonly<Ref<TSelected, TSelected>>, [TActions] extends [never] ? (updater) => void : TActions];
```

Defined in: [vue-store/src/\_useStore.ts:24](https://github.com/TanStack/store/blob/main/packages/vue-store/src/_useStore.ts#L24)

Experimental combined read+write hook for stores, mirroring useAtom's tuple
pattern.

Returns `[selected, actions]` when the store has an actions factory, or
`[selected, setState]` for plain stores.

## Type Parameters

### TState

`TState`

### TActions

`TActions` *extends* `StoreActionMap`

### TSelected

`TSelected` = `NoInfer`\<`TState`\>

## Parameters

### store

`Store`\<`TState`, `TActions`\>

### selector

(`state`) => `TSelected`

### options?

[`UseSelectorOptions`](../interfaces/UseSelectorOptions.md)\<`TSelected`\>

## Returns

\[`Readonly`\<`Ref`\<`TSelected`, `TSelected`\>\>, \[`TActions`\] *extends* \[`never`\] ? (`updater`) => `void` : `TActions`\]

## Example

```ts
// Store with actions
const [cats, { addCat }] = _useStore(petStore, (s) => s.cats)
console.log(cats.value)

// Store without actions
const [count, setState] = _useStore(plainStore, (s) => s)
setState((prev) => prev + 1)
```
