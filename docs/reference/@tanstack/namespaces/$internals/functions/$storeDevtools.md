---
id: $storeDevtools
title: $storeDevtools
---

# Function: $storeDevtools()

```ts
function $storeDevtools(): $StoreDevtoolsBridge;
```

Defined in: [devtoolsBridge.ts:49](https://github.com/TanStack/store/blob/main/packages/store/src/devtoolsBridge.ts#L49)

Returns the active bridge, or an empty bridge object when Devtools is absent. This is what
should be used throughout the core to emit events when necessary.

## Returns

[`$StoreDevtoolsBridge`](../interfaces/$StoreDevtoolsBridge.md)

## Example

```ts
mount() {
  $storeDevtools().mountAtom?.(this)
}
```
