---
id: "@tanstack/marko-store"
title: "@tanstack/marko-store"
---

# @tanstack/marko-store

The Marko adapter exposes its API as custom tags. Each tag is documented on its own page below.

## Tags

- [`<store-provider>`](tags/store-provider.md)
- [`<store-context>`](tags/store-context.md)
- [`<store-selector>`](tags/store-selector.md)
- [`<store-atom>`](tags/store-atom.md)
- [`<stream-store-provider>`](tags/stream-store-provider.md)

## Re-exports

`@tanstack/marko-store` re-exports the full `@tanstack/store` core, including `createStore`, `createAtom`, `Store`, `batch`, and `shallow`. Derived state comes from the core too — pass a function to `createStore` or `createAtom` to get a computed, read-only store. These are framework-agnostic; see the Store API Reference for their documentation.
