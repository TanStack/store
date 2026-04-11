---
id: useStoreActions
title: useStoreActions
---

# Function: useStoreActions()

```ts
function useStoreActions<TValue, TActions>(store): TActions;
```

Defined in: [react-store/src/useStoreActions.ts:16](https://github.com/TanStack/store/blob/main/packages/react-store/src/useStoreActions.ts#L16)

Returns the stable actions bag from a writable store created with actions.

Use this when a component only needs to call store actions and should not
subscribe to state changes.

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

```tsx
const actions = useStoreActions(counterStore)
actions.inc()
```
