---
id: _injectStore
title: _injectStore
---

# Function: \_injectStore()

```ts
function _injectStore<TState, TActions, TSelected>(
   store, 
   selector, 
options?): WritableStoreSliceSignal<TState, TSelected, TActions>;
```

Defined in: [packages/angular-store/src/\_injectStore.ts:34](https://github.com/TanStack/store/blob/main/packages/angular-store/src/_injectStore.ts#L34)

Experimental combined read+write injection function for stores, mirroring
injectAtom's pattern.

Returns a callable slice with methods when the store has an actions factory, or
with only the setState method for plain stores.

## Type Parameters

### TState

`TState`

### TActions

`TActions` *extends* `StoreActionMap`

### TSelected

`TSelected` = `NoInfer`\<`TState`\>

## Parameters

### store

`Store`\<`TState`, `TActions`\> | () => `Store`\<`TState`, `TActions`\>

### selector

(`state`) => `TSelected`

### options?

[`InjectSelectorOptions`](../interfaces/InjectSelectorOptions.md)\<`TSelected`\>

## Returns

`WritableStoreSliceSignal`\<`TState`, `TSelected`, `TActions`\>

## Example

```ts
// Store with actions
readonly dogs = _injectStore(petStore, (s) => s.dogs)
// dogs() and dogs.addDog()

// Store without actions
readonly value = _injectStore(plainStore, (s) => s)
// value() and value.setState(...)
```
