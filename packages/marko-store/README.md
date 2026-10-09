# @tanstack/marko-store

Marko 6 adapter for [TanStack Store](https://tanstack.com/store). It re-exports the
entire `@tanstack/store` core and adds five Marko tags so a component can read a
store, stay in sync as it changes, write to it, share stores with its children, and
build a store from data that streams in.

The re-exported core includes everything you'd import from `@tanstack/store`
directly — `createStore`, `createAtom`, `batch`, `shallow`, and friends. Derived
state is part of that core too: pass a function to `createStore`
(`createStore(() => count.state * 2)`) and read the result through
`<store-selector>` like any other store.

## The five tags

- `<store-selector>` — read a value out of a store and re-render when it changes.
- `<store-atom>` — read and write a single-value atom.
- `<store-provider>` — hand a group of stores down to children.
- `<store-context>` — grab those stores from a child in order to write to them.
- `<stream-store-provider>` — build a store from data that arrives inside a streamed
  `<await>`, then hand it down like a provider.

`<store-provider>` and `<store-context>` are a pair: `<store-provider>` shares the stores,
and `<store-context>` (or a selector in `context` mode) reads them back. `<store-context>`
does nothing on its own — with no provider above it, it throws (see Sharing stores).
`<stream-store-provider>` is the streaming sibling of `<store-provider>` — the same bundle,
for data that only shows up inside an `<await>` (see Streaming data into a store).

## Words used in this README

The rest of the doc leans on these, so it's worth pinning them down first.

- **Store** — an object that holds some state and lets you read it, change it, and
  listen for changes: `createStore({ count: 0, name: "Ada" })`.
- **Snapshot** (the store's *value*) — the whole state object right now,
  `{ count: 0, name: "Ada" }`. You read it with `store.state`.
- **Slice** — the part of a store's snapshot you select to watch. It can be a single
  field or a few related fields grouped together: `s => s.count`, or
  `s => ({ id: s.id, name: s.name })`. A slice is a portion of *one store's* state —
  not the same as a bundle member, which is a whole store inside a bundle (see Bundle).
- **Selector** — that picking function. `<store-selector>` re-renders only when the
  slice the selector returns changes, not on every store change.
- **Atom** — a store for a *single value* (`createAtom(0)`) with a direct setter.
  Reach for it when the state is just one thing.
- **Bundle** — one plain object that groups several stores under names,
  `{ user, cart }`. It's what `<store-provider>` shares. A bundle is one object
  holding many stores — not many providers (see "Sharing stores" below).

## Installation

```sh
npm install @tanstack/store @tanstack/marko-store
```

`marko` is a peer dependency (`^6`).

## Store or atom — which one?

Use a **Store** when your state has more than one field, or when you want to read
just a slice of it and re-render only when that slice changes. Use an **Atom** when
the state is a single value — a number, a flag, a string — that you read and set as
a whole.

The same counter, written both ways:

```marko
import { createStore, createAtom } from "@tanstack/store"

// Atom: the state IS the number. Read and set it directly.
static const countAtom = createAtom(0)
<store-atom/n from=(() => countAtom)>
  <button onClick() { n++ }>${n}</button>
</store-atom>

// Store: the number is one field of an object. Pick it with a selector,
// change it with setState.
static const countStore = createStore({ count: 0, updatedAt: 0 })
<store-selector/count from=(() => countStore) selector=(s => s.count)>
  <button onClick() { countStore.setState(s => ({ count: s.count + 1, updatedAt: Date.now() })) }>
    ${count}
  </button>
</store-selector>
```

Rule of thumb: one value → atom; an object you slice → store.

## Reading a store: `<store-selector>`

### Why not just read the value directly?

A store holds *live* state. Reading `store.state.count` once gives you the number at
that instant and nothing more — when the store changes later, your markup won't.
`<store-selector>` subscribes to the store for you and re-renders only when the slice
you selected changes. So `${store.state.count}` would show a stale `0` forever, while
`<store-selector>` keeps it correct. In short, `<store-selector>` is the piece that
makes your markup *reactive* to the store — a plain read is a one-off snapshot that
never updates.

### Basic use

```marko
static const store = createStore({ count: 0, name: "Ada" })
<store-selector/count from=(() => store) selector=(s => s.count)>
  <p>Count: ${count}</p>
</store-selector>
```

`from` is a *function* that returns the store, never the store itself. That keeps the
store out of serialized component state, which is what lets the page resume after
server rendering. It must return the same store every call — don't create the store
inside it.

(`static const store = ...`, as in the examples, runs once when the module loads — not
on every render — so the store lives at module level and never becomes part of
serializable component state. That's why it resumes cleanly and isn't "caught" by
serialization. The one catch is that a module-level store is shared across requests on
a server, which is why server rendering builds stores per request instead — see
Module-level vs per-request stores.)

### Attributes

| Attribute  | Required | Description                                                        |
| ---------- | -------- | ------------------------------------------------------------------ |
| `from`     | \*       | Function returning the store/atom (`() => store`).                 |
| `context`  | \*       | Pick a store out of a provided bundle (see Sharing stores). Use instead of `from`. |
| `selector` | no       | Maps the snapshot to the slice you want. Defaults to the whole snapshot. |
| `compare`  | no       | Decides what counts as "changed" for the slice. Defaults to `===`. |
| `key`      | no       | Which provided bundle to read, when using `context`. Defaults to the shared key. |

\* Supply exactly one of `from` or `context`. Passing both throws.

### The optional attributes, by example

No `selector` — track the whole snapshot:

```marko
<store-selector/whole from=(() => store)>
  <pre>${JSON.stringify(whole)}</pre>
</store-selector>
```

`compare` — define what "changed" means. Here, ignore case so `"Ada"` → `"ada"` does
not re-render:

```marko
<store-selector/name
  from=(() => store)
  selector=(s => s.name)
  compare=((a, b) => a.toLowerCase() === b.toLowerCase())
>
  <p>${name}</p>
</store-selector>
```

**Object and array slices need `compare=shallow`.** A selector that returns an object
or array (`s => ({ id: s.id, name: s.name })`) builds a *fresh reference on every
store change*, so the default `===` compare never sees two equal slices — the tag
re-renders on every change to the store, even ones your slice doesn't care about.
Pass `shallow` (re-exported from the core) to compare contents instead of identity:

```marko
import { shallow } from "@tanstack/marko-store"

<store-selector/user
  from=(() => store)
  selector=(s => ({ id: s.id, name: s.name }))
  compare=((a, b) => shallow(a, b))
>
  <p>${user.name}</p>
</store-selector>
```

`shallow` compares one level deep and also understands `Map`, `Set`, and `Date`.
Single-field slices (`s => s.count`) don't need it — primitives compare fine
with `===`.

One rule on **server-rendered pages**: pass it through an inline arrow,
`compare=((a, b) => shallow(a, b))`, as in the snippet above written inline. The
tag's input crosses Marko's serialization boundary on resume, and a bare imported
function isn't serializable (inline functions in `.marko` files are
compiler-registered; imports from plain JS are not — the dev server fails loudly
with "Unable to serialize … reading compare"). In a browser-only mount,
`compare=shallow` directly is fine.

`context` — read a store out of a bundle a `<store-provider>` shared, instead of from
a store you hold directly:

```marko
<store-selector/name context=(c => c.user) selector=(s => s.name)>
  <p>${name}</p>
</store-selector>
```

Use `context` when the store comes from a provider above you; use `from` when you
already hold the store (imported or module-level). The two are exclusive — exactly one.

`key` — when using `context`, picks which bundle to read if more than one provider is
in play; covered under Sharing stores.

Swapping the `selector` always re-publishes the new slice; `compare` only suppresses
repeat updates coming from store changes, never a deliberate change of selector.

## Writing an atom: `<store-atom>`

Two-way binding for an atom. The bound value is writable: assigning it calls the
atom's setter.

```marko
static const count = createAtom(0)
<store-atom/value from=(() => count)>
  <button onClick() { value++ }>${value}</button>
</store-atom>
```

| Attribute | Required | Description                          |
| --------- | -------- | ------------------------------------ |
| `from`    | yes      | Function returning the atom (`() => a`). |

`<store-atom>` is for atoms — it writes through the atom's `.set`. Hand it a `Store`
and it throws a clear error at render, because a `Store` has no such setter: read a
`Store` with `<store-selector>` and write it with `store.setState(...)`.

> Several writes in one tick collapse into one update. For dependent updates, use the
> function form: `count.set(p => p + 1)`.

## Sharing stores with children: `<store-provider>` + `<store-context>`

### What a bundle is, and how it differs from separate stores

A bundle is one plain object that groups stores under names: `{ user, cart }`.
`<store-provider>` parks that one object where children can find it, and each child
picks the store it wants out of it. This is deliberately **one provider holding many
stores** — not one provider per store. (Two providers under the same name clash; see
Nesting.)

### Is this just Marko's missing context tag?

It fills a similar role, but it isn't a generic context tag — and Marko's own
mechanism is worth knowing.

First, two ideas worth separating, since both involve "sharing." A **store** is the
live, changing state itself — you read it, write it, and subscribe to it, and it lasts
as long as you hold a reference to it. **Context** is only a *delivery* mechanism: a way
for a value to reach a deep child without threading it through every tag in between. On
its own, context says nothing about reactivity or how long something lives — it just
gets a value from an ancestor to its descendants. `<store-provider>` combines the two:
it delivers a *store* through a context-style channel, so children get both the reach
of context and the reactivity of a store.

"Context" usually means sharing a value down the tree without threading it through
every tag in between — a theme, the current user, a request id. Marko v5 did have a
`<context>` tag (in `@marko/tags`), but it's a class-component tag that passes plain
data, updates only when the provider re-renders (client-side), and predates Marko 6's
resumable runtime — so it's not a reactive store and not resume-safe. Marko 6 — the
tags API this adapter targets — has no `<context>` tag at all. Either way, the built-in
way to share a value is `$global` (the same object older Marko calls `out.global`): a
plain bag of values attached to one render. Two things
matter about it. It is **not reactive** — writing to `$global` doesn't re-render
anything. And it exists on **both** the server and the client render, but a value you
set on the server only reaches the client if you name it in `$global.serializedGlobals`
(a list/map of keys Marko then serializes into the page — the classic example is a CSP
nonce). Plain reads of those serialized values are available as `out.global` /
`$global` on the client.

`<store-provider>` is built on `$global` but is **store-specific**, not a general value
carrier. It groups stores as a bundle; because a live store can't be serialized it does
*not* put stores in `serializedGlobals` — instead it rebuilds the stores per request on
each side from data (the data rides the normal serialized input), so server and client
end up with matching stores. And since `$global` isn't reactive, the provider rings a
small internal signal when it mounts so selectors notice the bundle. So the rule of
thumb: to share a plain value, use `$global` / `serializedGlobals` directly; to share
*stores*, use `<store-provider>`.

### Can providers be nested?

Yes. Give each provider a distinct `key`, and a child reads whichever bundle it wants
by passing the matching key. Two providers sharing a key throw on purpose — that's
what stops two features from clobbering each other. (Verified by tests.)

The two `key`s play different roles: the **provider's** `key` *names* the bundle (the
slot it parks under), while a **selector's** or **`<store-context>`'s** `key` *chooses*
which named bundle to read. It's the same name seen from the writing side and the
reading side, so set them to match. Omit `key` everywhere and they all use one shared
default name.

```marko
<store-provider key="app" value=(() => ({ session }))>
  <store-provider key="cart" value=(() => ({ cart }))>
    <store-selector/user  key="app"  context=(c => c.session) selector=(s => s.user)/>
    <store-selector/items key="cart" context=(c => c.cart)    selector=(s => s.items)/>
  </store-provider>
</store-provider>
```

### The usual (server-render-ready) shape

Pass the per-request **data** and let the provider build the stores from it. Each
request gets its own fresh stores, and because only the data is serialized — the
stores are rebuilt from it on both the server and the client — the page resumes live
with nothing non-serializable crossing. A bundle can hold any number of stores; each
is read by its own selector and resumes on its own.

```marko
import { createStore } from "@tanstack/store"

export interface Input {
  user: { name: string }
  cart: { items: Array<string> }
}

<store-provider value=(() => ({
  user: createStore(input.user),
  cart: createStore(input.cart),
}))>
  <!-- two stores, two independent selectors -->
  <store-selector/name context=(c => c.user) selector=(s => s.name)>
    <p>${name}</p>
  </store-selector>

  <store-selector/itemCount context=(c => c.cart) selector=(s => s.items.length)>
    <p>${itemCount} in cart</p>
  </store-selector>

  <!-- write a member by reaching the bundle through store-context -->
  <store-context/ctx>
    <button onClick() { ctx().cart.setState(s => ({ ...s, items: [...s.items, "x"] })) }>
      add to cart
    </button>
  </store-context>
</store-provider>
```

`user` and `cart` live in one bundle, are each created from their own slice of the
per-request input, and resume independently on the client — incrementing the cart
doesn't touch `user`, and either store rehydrates on its own.

`<store-context>` returns a *getter* for the bundle, so write handlers call `ctx()`
and pick the member: `ctx().user.setState(...)`. It only works inside a
`<store-provider>` — there has to be a bundle for it to read — so with no provider
above it, it throws a clear error at render. (The selector's `context` mode is the
same; only `from` mode works without a provider.)

So when *do* you write through `<store-context>` versus directly? If you already hold a
store — imported or module-level — you write to it directly: `store.setState(...)`,
right in the handler. There's no write tag for that case and you don't need one
(`<store-selector>` only *reads*). `<store-context>` exists for the one case where you
*don't* hold the store: a `<store-provider>` handed it down, so the child has no direct
reference, and `<store-context>` is how it reaches back to the bundle to call
`setState`. (Atoms are the same idea: hold one directly and you use `<store-atom>` or
`atom.set(...)`.)

### What about a browser-only app (no server rendering)?

If your app runs only in the browser — a plain single-page app — there's no server
render to match, so you don't need per-request data. Create the stores once when the
module loads and put those same stores in the bundle:

```marko
static const user = createStore({ name: "Ada" })
static const cart = createStore({ items: [] })

<store-provider value=(() => ({ user, cart }))>
  ...
</store-provider>
```

The per-request version above exists only because server rendering needs a fresh set
of stores for every request. A browser-only app has just one session, so module-level
stores are fine.

### Module-level vs per-request stores

A **module-level store** is created once, at the top of a module
(`static const store = createStore(...)`), and there is a single shared instance for
the whole process. In the browser that's exactly what you want, and here's why: each
visitor loads the page in their *own* browser, so each gets their own copy of the
module and their own store instance. Its state builds up over that one session, fully
isolated from every other user. It's what the selector and atom examples above use.

A **per-request store** is created inside the provider's `value` from incoming data
(`createStore(input.data)`), so a fresh instance is built for each request, and again
on the client during resume.

Why it matters: on a server a module-level store is shared by *every* request at once,
so one visitor's state would leak into another's. Server rendering therefore needs
per-request stores. A browser-only app doesn't have that problem, so either works.
Rule of thumb: server-rendered → build the stores per request from data; browser-only
→ module-level stores are fine.

There's a third shape that looks like a fix for the leak but is broken under server
rendering: creating the store as a local `const` *inside a component*
(`<const/store=createStore(...)>` or a plain `const` in the component's body). It's
per-request on the server, but the client is dead: Marko's resume doesn't re-run the
component's body in the browser, so that store is never recreated there — handlers
fire, `setState` hits an instance nothing is subscribed to, and selectors never move.
Under server rendering, share stores through `<store-provider>` (which rebuilds them
on the client) or use a module-level store; don't create one inside a single
component and expect it to be live after resume.

### `<store-provider>` attributes

| Attribute | Required | Description                                                       |
| --------- | -------- | ----------------------------------------------------------------- |
| `value`   | yes      | Function returning the bundle object (`() => ({ a, b })`).        |
| `key`     | no       | Name this bundle so a selector/context can target it. Defaults to a shared name. |

## Streaming data into a store: `<stream-store-provider>`

### What "streaming" means here, and in-order vs out-of-order

Server rendering normally sends the whole page at once. **Streaming** lets the server send the
page in pieces: it flushes the shell immediately, then sends each slow piece — a section waiting on
a database call, say — later, as its data becomes ready. In Marko you mark a slow piece with
`<await>`: the shell paints right away, and the awaited block streams in when its promise resolves.

Two slow pieces can finish in either order. **In-order** streaming keeps them in document order — a
piece that finishes early still waits its turn, so the page fills top to bottom. A plain `<await>`
is in-order. **Out-of-order** streaming lets a piece that finishes first paint first, even if it
sits lower in the page, with a placeholder holding its spot until then; you opt into it by wrapping
the `<await>` in `<try>` with a `<@placeholder>`. Out-of-order reaches first content sooner but
needs the placeholder slot. `<stream-store-provider>` behaves identically either way.

### Why a separate tag from `<store-provider>`

`<store-provider>` builds its stores up front, in the shell, because their data is ready before the
page renders. Streamed data isn't ready then — it only exists once the `<await>` resolves, which is
*after* the shell (and the provider) have already rendered. So the provider can't build a store
from streamed data: it runs too early. `<stream-store-provider>` is the provider you put *inside*
the awaited block, where the data finally exists. It builds the store there — on the server as the
piece renders, and again in the browser as the piece resumes — so the store is **born with the
data** on both sides. The value paints on the server (no empty first frame, no flash) and the store
is live after resume, exactly like `<store-provider>`, just sourced from data that arrived late.

Under the hood it is the same machinery as `<store-provider>`: the store is parked on `$global`
(never serialized), and only the plain awaited value crosses the wire, carried inside the block
because the `value` thunk names it. A live store is never serialized. This is also why you must not
hand the awaited data to a store you hold in an ordinary variable inside the block — see Gotchas.

### When to use it, and when not to

Use `<stream-store-provider>` when a store's data arrives **inside a streamed `<await>`** — a
per-request fetch you have deferred so the shell can paint first. It works whether that `<await>`
is in-order or wrapped in `<try>` for out-of-order.

Do **not** use it for data that is ready at render — a normal per-request store built from `input`.
That is `<store-provider>`'s job; reach for it there. And it is not a general "lazy provider": its
whole reason to exist is the streamed-`<await>` timing, so put it inside an `<await>`. (Used outside
one it degrades to provider-like behavior and still works, but then you have just written a heavier
`<store-provider>`.)

Rule of thumb: data ready at render → `<store-provider>`; data that streams in inside an `<await>`
→ `<stream-store-provider>`.

### Basic use

```marko
import { createStore } from "@tanstack/store"

export interface Input {
  userId: string
}

<await|profile|=fetchProfile(input.userId)>
  <stream-store-provider key="profile" value=(() => ({ profile: createStore(profile) }))>
    <store-selector/name context=(c => c.profile) selector=(s => s.name)>
      <p>${name}</p>
    </store-selector>
  </stream-store-provider>
</await>
```

`profile` is the awaited data. The `value` thunk closes over it and builds the bundle right there.
Because the thunk *names* `profile`, Marko ships that data with the block, so the same thunk
rebuilds the store in the browser when the block resumes. Children read it with `<store-selector>`
in `context` mode exactly as under `<store-provider>`, and write it through `<store-context>`. The
`value` thunk and the bundle are identical to `<store-provider>` — a bundle can hold any number of
stores, each read by its own selector. The only shape difference is *where* the tag goes: inside the
`<await>`, so it can see the data.

### Out-of-order, and catching errors: `<try>`

The helper is ordering-agnostic — it only builds the store inside the block. Ordering is decided by
the block around it. A plain `<await>` is in-order. To go out-of-order, wrap the `<await>` in
`<try>` with a `<@placeholder>`; the block can then paint as soon as its data resolves, with the
placeholder holding its slot until then:

```marko
<try>
  <await|profile|=fetchProfile(input.userId)>
    <stream-store-provider key="profile" value=(() => ({ profile: createStore(profile) }))>
      <store-selector/name context=(c => c.profile) selector=(s => s.name)>
        <p>${name}</p>
      </store-selector>
    </stream-store-provider>
  </await>
  <@placeholder>
    <p>Loading…</p>
  </@placeholder>
</try>
```

`<try>` is also Marko's error boundary for a streamed block. If anything inside the `<await>`
throws — a rejected fetch, or the duplicate-key guard below — add a `<@catch>` and the block renders
the fallback instead of breaking the stream:

```marko
<try>
  <await|profile|=fetchProfile(input.userId)>
    <stream-store-provider key="profile" value=(() => ({ profile: createStore(profile) }))>
      <store-selector/name context=(c => c.profile) selector=(s => s.name)>
        <p>${name}</p>
      </store-selector>
    </stream-store-provider>
  </await>
  <@catch|err|>
    <p>Couldn't load that section: ${err.message}</p>
  </@catch>
</try>
```

This is Marko's `<try>` / `<@catch>`, not a JavaScript `try`/`catch`.

### Keys: name the box, and don't share it

`key` works exactly like `<store-provider>`'s, and is **required** here (no default). It names the
box the bundle is parked in, and the matching `key` on a selector or `<store-context>` chooses which
box to read. Give each streamed provider a distinct `key`.

A `<store-provider>` and a `<stream-store-provider>` — or two of either — on the **same key** is
always a mistake: a box holds one bundle, so the second would clobber the first. They detect each
other and **throw** a duplicate-key error rather than overwrite silently. Wrap the block in
`<try>` / `<@catch>` if you want that surfaced as a fallback instead of a broken stream (see above).
`key` is required, with no shared default, precisely so a streamed provider cannot quietly collide
with a top-level provider's default name.

### Gotchas

- **Do not hold the store in a plain variable inside the block.** Build it through the `value` thunk
  (which parks it on `$global`); never as `<const/s=createStore(data)/>` inside the `<await>`. A
  `<const>` becomes part of the block's serialized state, a live store cannot be serialized, and the
  server render throws "Unable to serialize". The thunk keeps the store off that path. This is the
  one real trap, and the reason the tag exists instead of a one-liner.
- **A selector *above* the block** cannot have the data yet — the block has not rendered. It shows
  its default (empty / `undefined`, since the selector is null-tolerant) and then updates the instant
  the block lands and the store is parked. A selector *inside* the block shows the value immediately,
  with no flash. Put readers that must be correct on first paint inside the block.
- **`<store-context>` above the block throws** at render, because the box is still empty at that
  point — you cannot grab a streamed store from above where it is created. Read or write the streamed
  store from inside the block.
- **Browser-only apps** (no server render) build the store once: the tag guards against the build
  running twice on a pure client render. You generally do not need streaming in a browser-only app,
  but it is safe if it appears.

### `<stream-store-provider>` attributes

| Attribute | Required | Description                                                                 |
| --------- | -------- | --------------------------------------------------------------------------- |
| `value`   | yes      | Function returning the bundle object (`() => ({ a, b })`), built from the awaited data. Same as `<store-provider>`. |
| `key`     | yes      | Names this bundle's box so a selector / `<store-context>` can target it. Required, and must be distinct per provider — there is no shared default. |

Reading and writing the streamed stores is unchanged: `<store-selector>` in `context` mode reads a
member, `<store-context>` reaches the bundle to write, and typing the bundle works the same way
(see Typing the bundle).

## Typing the bundle

This section is about TypeScript and editor autocomplete only — it changes nothing at
runtime.

When you read a member with `context=(c => c.user)`, TypeScript can't tell what `c`
is. The bundle's shape doesn't travel across the tag boundary in the current Marko
type tooling, so `c` comes through as `unknown` — TypeScript's "I have no idea what
this is" type. On an `unknown` value, `c.user` has no type, you get no autocomplete,
and if you try to use it as a specific shape TypeScript reports an error.

The fix is to tell TypeScript the shape yourself, in two places:

```marko
// 1) annotate the picker's parameter
<store-selector/name
  context=((c: { user: typeof user; cart: typeof cart }) => c.user)
  selector=(s => s.name)
/>

// 2) assert the getter when writing
(ctx() as { user: typeof user; cart: typeof cart }).user.setState(...)
```

`typeof user` just reuses the store's own type, so you don't retype its shape. Once
annotated, `c.user` and the write are fully typed with working autocomplete. (We
looked hard for a way to make this automatic; in the current Marko toolchain it isn't,
so the annotation is the supported way. It's a typing-ergonomics gap, not a
functionality one.)

## SSR vs client-side: things to know

- **Server-rendered page.** Every tag paints correctly on the first render, and the
  page picks up live updates after it hydrates. Nothing special to do.
- **Don't create stores inside a component under SSR.** A store built as a local
  `const` inside a component renders fine on the server but is dead in the browser —
  resume doesn't re-run the component's body, so the store is never recreated
  client-side. Provide stores via `<store-provider>` or at module level instead
  (see "Module-level vs per-request stores").
- **Browser-only first paint.** When a page is mounted purely in the browser (not
  server-rendered) and a selector reads from a context bundle, that selector can show
  an empty value for the very first frame and then immediately correct itself. The
  provider fills the bundle a beat before the selector reads it, and a built-in
  recovery step catches up right away. Server-rendered pages don't show this.
- **Streaming with `<await>`.** When a store's data arrives inside a streamed `<await>`,
  build the store right inside the block with `<stream-store-provider>` (see "Streaming
  data into a store"). It's born with the data on both the server and the client, so the
  value paints during streaming with no flash and resumes live. The one rule: build the
  store through the tag's `value` thunk — never hold it in a plain variable inside the
  block, since a live store can't be serialized with the block's state.
- **What store data can cross the wire.** Anything Marko's serializer supports can sit
  in the data your stores are built from: primitives (including `bigint`), plain
  objects and arrays (nested fine), `Date`, `Map`, `Set`, `RegExp`, typed arrays and
  `ArrayBuffer`, `URL`/`URLSearchParams`, and errors. What can't: instances of your own
  classes, DOM nodes, and functions Marko didn't register (top-level/template functions
  are fine). In dev, a non-serializable value fails loudly with an "Unable to serialize"
  error pointing at the offending code; a production build silently drops it — so trust
  the dev error, never prod, to catch this. Keep server-provided store data as plain
  data (or the supported built-ins) and you'll never meet either behavior. The source
  of truth is Marko's `runtime-tags/src/html/serializer.ts`.

## TypeScript configs

These four `tsconfig` files are about building and type-checking this package
itself — if you're only *using* `@tanstack/marko-store`, you can skip this. Each does
one job: two type-check, two emit, split across the two tools involved (`tsdown` for
the plain-TypeScript index, `marko-type-check` for the `.marko` tags).

| File | What it does | Why it's needed |
| --- | --- | --- |
| `tsconfig.json` | The base every other config extends. Holds the shared compiler settings and maps `@tanstack/store` to `../store/src`. | One place for the defaults, used by editors and inherited by the rest. The path mapping gives live types from the sibling `store` package with no build step. |
| `tsconfig.build.json` | Used by `tsdown` to compile `src/index.ts` into `dist` (the ESM/CJS core re-export). Blanks the `@tanstack/store` path mapping. | The published index must resolve `@tanstack/store` as the real installed dependency — the way a consumer's build sees it — not as local workspace source. |
| `tsconfig.marko.json` | Used by `marko-type-check` to type-check the package, `.marko` files included, writing nothing (`noEmit`). Covers `src` and `tests`. | Checking `.marko` needs Marko-aware resolution. This is the `test:types:marko` check; a check step should never emit output. The `e2e` app is its own nested package and runs its own `marko-type-check`. |
| `tsconfig.tags.json` | Used by `marko-type-check` to *build* the tags: compiles `src/tags` into `dist/tags` (stripped `.marko` + generated `.d.marko` + the `store-bus` helper). Scoped to `src/tags` only. | Publishing ships built tags, not raw source. It's scoped so it doesn't rebuild the index (`tsdown` owns that), and unlike the check config it emits (`declaration` on, `noEmit` off). |

Why four rather than one: two things vary and can't share a file — **check vs emit**
(a config has a single `noEmit` and `outDir`) and **which tool/scope** (`tsdown` for
the index vs `marko-type-check` for the tags, with different `include` lists). Two of
them use the same tool for opposite ends — one checks and emits nothing, the other
emits just the tags.

## License

MIT
