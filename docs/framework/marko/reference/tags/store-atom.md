---
id: store-atom
title: "<store-atom>"
---

# Tag: `<store-atom>`

Binds a single writable atom from `createAtom()` as a two-way value: it reads the atom's current value and writes back through the atom's `set`. Use it for a standalone writable value; for a `Store` (from `createStore`), read it with `<store-selector>` instead.

```marko
<store-atom/qty from=() => qtyAtom>
<p>Quantity: ${qty}</p>
```

## Type parameters

- **`T`** — the atom's value type.

## Attributes

- **`from`** — `() => { get(); set(); subscribe() } | null` (required). A thunk returning the atom (from `createAtom()`), or `null` while nothing is available yet — the null-tolerant form matters for getter-fed atoms (`from=(() => ctx()?.countAtom ?? null)`), where the context bundle isn't parked for a beat during resume or a browser-only first paint. A non-null value without a `set` method (such as a `Store`) still throws with guidance to use `<store-selector>`.

## Tag variable

The atom's current value, typed `T`. The tag exposes a `value`/`valueChange` pair, so it is two-way bindable — bind it to a variable with `value:=` and assignments write back through the atom's `set`.

## Behavior

The value is seeded from `from().get()` at render and kept live by a subscription on mount, so it updates whenever the atom changes from anywhere. Writes go through `from().set(next)`. If `from()` resolves nothing yet (a getter-fed atom before its provider parks the bundle), the tag renders `undefined` for that beat and listens on the internal publish bus, attaching the moment the bundle lands — the same recovery `<store-selector>` performs. If `from()` returns a non-null value without a `set` method (such as a `Store`), the tag throws with guidance to use `<store-selector>`.
