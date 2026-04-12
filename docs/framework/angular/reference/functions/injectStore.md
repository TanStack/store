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

Defined in: [packages/angular-store/src/index.ts:238](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L238)

Deprecated alias for [injectSelector](injectSelector.md).

## Type Parameters

### TState

`TState`

### TSelected

`TSelected` = `NoInfer`\<`TState`\>

## Parameters

### store

`SelectionSource`\<`TState`\>

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
