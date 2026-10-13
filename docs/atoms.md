---
title: Atoms
id: atoms
---

Atoms are the low-level reactive values that power TanStack Store. They are
framework-agnostic and can be used directly when you want a small state primitive
with `get()`, `subscribe()`, and, for writable atoms, `set()`.

Use a `Store` when you want the higher-level state API with `.state`,
`.setState()`, and optional actions. Use an atom when you want to pass a
reactive value directly to framework adapters, compose fine-grained derived
values, or build a smaller primitive without the store wrapper.

## Writable atoms

Pass an initial value to `createAtom` to create a writable atom.

```typescript
import { createAtom } from '@tanstack/store'

const count = createAtom(0)

console.log(count.get()) // 0

count.set((prev) => prev + 1)
console.log(count.get()) // 1

count.set(10)
console.log(count.get()) // 10
```

Writable atoms expose:

- `get()` to read the current value
- `set(value)` or `set((prev) => next)` to update the value
- `subscribe(listener)` to react to future updates

```typescript
const subscription = count.subscribe((value) => {
  console.log('The count is now:', value)
})

count.set((prev) => prev + 1)

subscription.unsubscribe()
```

## Readonly derived atoms

Pass a function to `createAtom` to create a readonly derived atom. Derived atoms
track other atoms or stores that are read while computing their value.

```typescript
import { createAtom } from '@tanstack/store'

const count = createAtom(1)
const double = createAtom(() => count.get() * 2)

console.log(double.get()) // 2

count.set(5)
console.log(double.get()) // 10
```

Readonly atoms still expose `get()` and `subscribe()`, but they do not expose
`set()`.

## Custom comparison

Atoms use `Object.is` to decide whether a new value should notify subscribers.
Pass `compare` when you need a different equality check.

```typescript
import { createAtom, shallow } from '@tanstack/store'

const settings = createAtom(
  { theme: 'dark', sidebar: 'expanded' },
  { compare: shallow },
)

settings.set((prev) => ({ ...prev }))
```

In this example, subscribers are not notified for the last update because the
new object is shallowly equal to the previous value.

## Async atoms

Use `createAsyncAtom` when the atom value comes from a promise. It returns a
readonly atom whose value is an async state object.

```typescript
import { createAsyncAtom } from '@tanstack/store'

const user = createAsyncAtom(async () => {
  const response = await fetch('/api/user')
  return response.json()
})

console.log(user.get()) // { status: 'pending' }
```

When the promise settles, the atom updates to either `{ status: 'done', data }`
or `{ status: 'error', error }`.

## Atoms vs stores

`Store` is a small wrapper around an atom. Both can be read and subscribed to,
but they expose different APIs:

| Use case | Atom | Store |
| --- | --- | --- |
| Read current value | `atom.get()` | `store.state` or `store.get()` |
| Update writable value | `atom.set(...)` | `store.setState(...)` |
| Derived value | `createAtom(() => ...)` | `createStore(() => ...)` |
| Actions | Compose functions around the atom | Built in through `createStore(initialValue, actions)` |

If you are building app-level state and want the most ergonomic API, start with
`createStore`. If you are building reusable reactive primitives, framework
adapter state, or fine-grained values shared through atom hooks, use
`createAtom`.

## Framework adapters

Framework packages can consume atoms directly. For example, React and Preact
provide `useAtom` for writable atoms and `useSelector` for atoms or stores,
while Angular provides `injectAtom`.

See the Atoms examples in each framework section for adapter-specific usage.

## API reference

- [`createAtom`](reference/functions/createAtom.md)
- [`createAsyncAtom`](reference/functions/createAsyncAtom.md)
- [`Atom`](reference/interfaces/Atom.md)
- [`ReadonlyAtom`](reference/interfaces/ReadonlyAtom.md)
- [`AtomOptions`](reference/interfaces/AtomOptions.md)
