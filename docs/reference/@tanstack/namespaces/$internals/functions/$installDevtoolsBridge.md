---
id: $installDevtoolsBridge
title: $installDevtoolsBridge
---

# Function: $installDevtoolsBridge()

```ts
function $installDevtoolsBridge(bridge): () => void;
```

Defined in: [devtoolsBridge.ts:23](https://github.com/TanStack/store/blob/main/packages/store/src/devtoolsBridge.ts#L23)

Installs the active Devtools bridge for store lifecycle notifications.

This is intentionally an internals-only API. Store Devtools calls it when the
Devtools panel/context is mounted, and core runtime code reads the active
bridge through `devtools()`. The returned cleanup removes this bridge only if
it is still the active bridge.

## Parameters

### bridge

[`$StoreDevtoolsBridge`](../interfaces/$StoreDevtoolsBridge.md)

## Returns

```ts
(): void;
```

### Returns

`void`
