---
title: Quick Start
id: quick-start
---

The basic Marko app example to get started with TanStack `marko-store`.

Marko exposes the store through tags rather than hooks. `<store-selector>` reads a slice of a store and keeps it live, re-rendering only when that selected slice changes. State is updated with `store.setState`, exactly as in the other adapters.

```marko
import { createStore } from '@tanstack/marko-store'

// You can instantiate a Store outside of Marko templates too!
export const store = createStore({
  dogs: 0,
  cats: 0,
})

<div>
  <h1>How many of your friends like cats or dogs?</h1>
  <p>
    Press one of the buttons to add a counter of how many of your friends
    like cats or dogs.
  </p>

  <button onClick() { store.setState((s) => ({ ...s, dogs: s.dogs + 1 })) }>
    My Friend Likes dogs
  </button>
  // <store-selector> subscribes only to state.dogs
  <store-selector/dogs from=() => store selector=(state) => state.dogs/>
  <div>dogs: ${dogs}</div>

  <button onClick() { store.setState((s) => ({ ...s, cats: s.cats + 1 })) }>
    My Friend Likes cats
  </button>
  <store-selector/cats from=() => store selector=(state) => state.cats/>
  <div>cats: ${cats}</div>
</div>
```

`<store-selector>` binds the latest selected value to its tag variable (here `dogs` and `cats`) and only updates when that specific selection changes.

## A writable value: `<store-atom>`

For a single writable value, `<store-atom>` gives two-way access to an atom — read its tag variable, and assign to it to write back:

```marko
import { createAtom } from '@tanstack/marko-store'
export const countAtom = createAtom(0)

<store-atom/count from=() => countAtom/>
<button onClick() { count++ }>count is ${count}</button>
```

## Sharing stores without imports: `<store-provider>` and `<store-context>`

To distribute one or more stores down the tree without importing them everywhere, wrap a subtree in `<store-provider>` with a bundle of stores, read any value below with `<store-selector>` in context mode, and grab the bundle to write with `<store-context>`:

```marko
import { createStore } from '@tanstack/marko-store'

<store-provider value=() => ({ cats: createStore({ count: 0 }) })>
  <store-selector/catCount context=(c) => c.cats selector=(s) => s.count/>
  <div>cats: ${catCount}</div>

  <store-context/ctx/>
  <button onClick() { ctx().cats.setState((s) => ({ count: s.count + 1 })) }>add a cat</button>
</store-provider>
```

## Server rendering and streaming

`marko-store` is resumable: a store rendered on the server stays live on the client after resume, with no re-execution. For server-computed, per-request data that arrives mid-render through `<await>`, create the store from the awaited value inside the await using `<stream-store-provider>`. The value then renders on the server with no first-paint flash and the store stays live after resume:

```marko
import { createStore } from '@tanstack/marko-store'

<await|user|=fetchUser()>
  <stream-store-provider key='user' value=() => ({ user: createStore(user) })>
    <store-selector/name key='user' context=(c) => c.user selector=(s) => s.name/>
    <div>${name}</div>
  </stream-store-provider>
</await>
```

Use a plain `<await>` for in-order streaming, or wrap it in `<try>` with a `<@placeholder>` for out-of-order streaming. Each `<stream-store-provider>` needs a distinct `key`.

For production SSR, use [`@marko/run`](https://github.com/marko-js/run), Marko's official server framework. Standalone `@marko/vite` SSR is intended for development only.
