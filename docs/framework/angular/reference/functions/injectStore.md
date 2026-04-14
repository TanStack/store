---
id: _injectStore
title: _injectStore
---

# Function: \_injectStore()

```ts
function _injectStore<TState, TActions, TSelected>(
   store, 
   selector, 
   options?): [Signal<TSelected>, [TActions] extends [never] ? (updater) => void : TActions];
```

Defined in: [packages/angular-store/src/\_injectStore.ts:24](https://github.com/TanStack/store/blob/main/packages/angular-store/src/_injectStore.ts#L24)

Experimental combined read+write injection function for stores, mirroring
injectAtom's pattern.

Returns `[signal, actions]` when the store has an actions factory, or
`[signal, setState]` for plain stores.

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

[`InjectSelectorOptions`](../interfaces/InjectSelectorOptions.md)\<`TSelected`\>

## Returns

\[`Signal`\<`TSelected`\>, \[`TActions`\] *extends* \[`never`\] ? (`updater`) => `void` : `TActions`\]

## Example

```ts
// Store with actions
readonly result = _injectStore(petStore, (s) => s.cats)
// result[0] is Signal<number>, result[1] is actions

// Store without actions
readonly result = _injectStore(plainStore, (s) => s)
// result[0] is Signal<number>, result[1] is setState
```
