---
id: injectStore
title: injectStore
---

# Function: injectStore()

```ts
function injectStore<TState, TSelected>(
   storeOrStoreSignal, 
   selector, 
options): Signal<TSelected>;
```

Defined in: [index.ts:14](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L14)

## Type Parameters

### TState

`TState`

### TSelected

`TSelected` = `NoInfer`\<`TState`\>

## Parameters

### storeOrStoreSignal

`Atom`\<`TState`\> | `ReadonlyAtom`\<`TState`\> | () => `Atom`\<`TState`\> \| `ReadonlyAtom`\<`TState`\>

### selector

(`state`) => `TSelected`

### options

`CreateSignalOptions`\<`TSelected`\> & `object` = `...`

## Returns

`Signal`\<`TSelected`\>
