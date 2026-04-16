---
'@tanstack/angular-store': minor
'@tanstack/preact-store': minor
'@tanstack/svelte-store': minor
'@tanstack/react-store': minor
'@tanstack/solid-store': minor
'@tanstack/vue-store': minor
---

feat!: remove `useValue` / `injectValue` in favor of `useSelector` / `injectSelector` with default selector

The `useSelector` (and `injectSelector` for Angular) hook now accepts an optional selector parameter that defaults to the identity function `(s) => s`. Calling without a selector returns the whole value of the source — replacing the previous `useValue` / `injectValue` hook.

**Migration:**

```ts
// Before
const value = useValue(atom)
const value = useValue(atom, { compare })

// After
const value = useSelector(atom)
const value = useSelector(atom, undefined, { compare })
```

For Angular, replace `injectValue` with `injectSelector` using the same pattern.
