---
id: store-context
title: "<store-context>"
---

# Tag: `<store-context>`

Reads the store bundle provided by the nearest `<store-provider>` with a matching key, so a descendant can use the live stores directly (for example to dispatch actions). Binds a getter.

```marko
<store-context/getBundle>
<const/cart=getBundle().cart>
<button onClick() { cart.setState((s) => ({ count: s.count + 1 })) }>
  Add one
</button>
```

## Attributes

- **`key`** — `string` (optional, default `"__tanstack_store_context"`). The context key to read. Must match the key the `<store-provider>` used.

## Tag variable

A getter function, `() => bundle`. Call it to read the current bundle parked by the provider. It is a thunk rather than the bundle itself so the read happens at call time, after the provider has parked the bundle.

## Behavior

At render the tag checks that a bundle exists on `$global` under the key and throws if none is found — that is, when there is no `<store-provider>` above it. It does not subscribe to anything; use `<store-selector>` when you need a value that re-renders on change.
