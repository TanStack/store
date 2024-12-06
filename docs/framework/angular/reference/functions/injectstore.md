---
id: injectStore
title: injectStore
---

# Function: injectStore()

```ts
function injectStore<TState, TSelected, TUpdater>(
   store, 
   selector, 
options): Signal<TSelected>
```

## Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

• **TUpdater** *extends* `AnyUpdater` = `AnyUpdater`

## Parameters

### store

`Store`\<`TState`, `TUpdater`\>

### selector

(`state`) => `TSelected`

### options

`CreateSignalOptions`\<`TSelected`\> & `object` = `...`

## Returns

`Signal`\<`TSelected`\>

## Defined in

[index.ts:17](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L17)
