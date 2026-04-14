---
id: _useStore
title: _useStore
---

# Function: \_useStore()

```ts
function _useStore<TState, TActions, TSelected>(
   store, 
   selector, 
   options?): [TSelected, [TActions] extends [never] ? (updater) => void : TActions];
```

Defined in: [preact-store/src/\_useStore.ts:24](https://github.com/TanStack/store/blob/main/packages/preact-store/src/_useStore.ts#L24)

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

\[`TSelected`, \[`TActions`\] *extends* \[`never`\] ? (`updater`) => `void` : `TActions`\]

## Example

```tsx
// Store with actions
const [cats, { addCat }] = _useStore(petStore, (s) => s.cats)

// Store without actions
const [count, setState] = _useStore(plainStore, (s) => s)
setState((prev) => prev + 1)
```
