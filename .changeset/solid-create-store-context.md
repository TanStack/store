---
'@tanstack/solid-store': minor
---

feat: add `createStoreContext` for Solid

Mirrors the React/Preact `createStoreContext` API. Returns a typed `{ StoreProvider, useStoreContext }` pair for sharing a bundle of atoms and stores through Solid context.

```tsx
const { StoreProvider, useStoreContext } = createStoreContext<{
  countAtom: Atom<number>
  totalsStore: Store<{ count: number }>
}>()

function App() {
  return (
    <StoreProvider value={{ countAtom, totalsStore }}>
      <Child />
    </StoreProvider>
  )
}

function Child() {
  const { countAtom, totalsStore } = useStoreContext()
  const count = useSelector(countAtom)
  // ...
}
```
