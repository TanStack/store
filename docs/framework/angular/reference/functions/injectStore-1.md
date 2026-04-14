---
id: injectStore
title: injectStore
---

# ~~Function: injectStore()~~

```ts
function injectStore<TState, TSelected>(
   store, 
   selector?, 
options?): Signal<TSelected>;
```

Defined in: [packages/angular-store/src/injectStore.ts:20](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectStore.ts#L20)

Deprecated alias for [injectSelector](injectSelector.md).

## Type Parameters

### TState

`TState`

### TSelected

`TSelected` = `NoInfer`\<`TState`\>

## Parameters

### store

[`SelectionSource`](../type-aliases/SelectionSource.md)\<`TState`\>

### selector?

(`state`) => `TSelected`

### options?

`CompatibilityInjectStoreOptions`\<`TSelected`\>

## Returns

`Signal`\<`TSelected`\>

## Example

```ts
readonly count = injectStore(counterStore, (state) => state.count)
```

## Deprecated

Use `injectSelector` instead.
