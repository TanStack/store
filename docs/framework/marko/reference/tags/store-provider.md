---
id: store-provider
title: "<store-provider>"
---

# Tag: `<store-provider>`

Creates a bundle of stores for the current request and makes it available to descendant tags by a context key. Wraps the content it is given.

```marko
<store-provider value=() => ({ cart: createStore({ items: [] }) })>
  <cart-view/>
</store-provider>
```

## Attributes

- **`value`** — `() => Record<string, unknown>` (required). A thunk returning the bundle of named stores or atoms to provide. It is called once on the server at render and again on the client at mount, so each environment gets its own live instances.
- **`key`** — `string` (optional, default `"__tanstack_store_context"`). The context key the bundle is parked under. Use distinct keys to provide more than one bundle on a page. The matching `<store-context>` and context-mode `<store-selector>` must use the same key.
- **`content`** — `Marko.Body` (optional). The body rendered inside the provider, usually supplied implicitly as the tag's children.

## Tag variable

None. `<store-provider>` is a wrapper: it renders its content and binds no tag variable.

## Behavior

The bundle is parked on `$global` under the context key at render, and re-created and published on mount so client subscribers attach to live instances. Only one provider may claim a given key: a second `<store-provider>` (or a `<stream-store-provider>`) on the same key throws, to prevent two writers silently clobbering the same box. On destroy the box and its owner marker are cleared.
