---
id: injectStoreActions
title: injectStoreActions
---

# Function: injectStoreActions()

```ts
function injectStoreActions<TValue, TActions>(store): TActions;
```

Defined in: [packages/angular-store/src/index.ts:222](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L222)

Returns the stable actions bag from a writable store created with actions.

Use this when a component only needs to call store actions and should not
subscribe to store state.

## Type Parameters

### TValue

`TValue`

### TActions

`TActions` *extends* `StoreActionMap`

## Parameters

### store

`Store`\<`TValue`, `TActions`\>

## Returns

`TActions`

## Example

```ts
readonly actions = injectStoreActions(counterStore)

increment() {
  this.actions.increment()
}
```
