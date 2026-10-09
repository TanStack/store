---
id: stream-store-provider
title: "<stream-store-provider>"
---

# Tag: `<stream-store-provider>`

A provider for progressive streaming: it creates a per-request store bundle from data that becomes available inside a late `<await>`, and keeps it live across the server-to-client boundary. Place it inside the awaited body so the awaited value is captured into `value`. Wraps its content.

```marko
<await|order|=loadOrder(orderId)>
  <stream-store-provider key="order" value=() => ({ order: createStore(order) })>
    <store-selector/total context=(b) => b.order selector=(o) => o.total>
    <p>Total: ${total}</p>
  </stream-store-provider>
</await>
```

## Attributes

- **`value`** — `() => Record<string, unknown>` (required). A thunk returning the bundle of stores or atoms, built from the awaited per-request data. Called on the server at render and again on the client at mount.
- **`key`** — `string` (**required**). The context key the bundle is parked under. Unlike `<store-provider>`, there is no default; each streamed provider needs an explicit, distinct key.
- **`content`** — `Marko.Body` (optional). The body rendered inside the provider.

## Tag variable

None. Like `<store-provider>`, it renders its content and binds no tag variable.

## Behavior

This is the "born-with-data" transport. The awaited value is captured by `value` and crosses to the client through the await subtree's resume scope; the bundle is built into `$global` under the key on the server, and rebuilt and published on mount so client subscribers attach to live instances. It shares `<store-provider>`'s owner marker, so a `<store-provider>` and a `<stream-store-provider>` on the same key detect each other and throw rather than clobber. For production, a streaming Marko app must run under `@marko/run`; a standalone `@marko/vite` production build does not coordinate resume correctly.
