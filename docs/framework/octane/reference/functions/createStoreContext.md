---
id: createStoreContext
title: createStoreContext
---

# Function: createStoreContext()

```ts
function createStoreContext<TValue>(): object;
```

Defined in: octane-store/src/createStoreContext.ts:44

Creates a typed Octane context for sharing a bundle of atoms and stores with
a subtree.

The returned `StoreProvider` only transports the provided object through
Octane context. Consumers destructure the contextual atoms and stores, then
compose them with hooks like [useSelector](useSelector.md) and [useAtom](useAtom.md).

The object shape is preserved exactly, so keyed atoms and stores remain fully
typed when read back with `useStoreContext()`.

## Type Parameters

### TValue

`TValue` *extends* `object`

## Returns

`object`

### StoreProvider

```ts
StoreProvider: ComponentBody<{
  children?: unknown;
  value: TValue;
}>;
```

### useStoreContext()

```ts
useStoreContext: () => TValue;
```

#### Returns

`TValue`

## Example

```tsx
const { StoreProvider, useStoreContext } = createStoreContext<{
  countAtom: Atom<number>
  totalsStore: Store<{ count: number }>
}>()

function CountButton() @{
  const { countAtom, totalsStore } = useStoreContext()
  const count = useSelector(countAtom)
  const total = useSelector(totalsStore, (state) => state.count)

  <button
    type="button"
    onClick={() =>
      totalsStore.setState((state) => ({
        ...state,
        count: state.count + 1,
      }))
    }
  >
    {count + ' / ' + total}
  </button>
}
```

## Throws

When `useStoreContext()` is called outside the matching
`StoreProvider`.
