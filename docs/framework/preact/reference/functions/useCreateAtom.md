---
id: useCreateAtom
title: useCreateAtom
---

# Function: useCreateAtom()

## Call Signature

```ts
function useCreateAtom<T>(getValue, options?): ReadonlyAtom<T>;
```

Defined in: [preact-store/src/useCreateAtom.ts:27](https://github.com/TanStack/store/blob/main/packages/preact-store/src/useCreateAtom.ts#L27)

Creates a stable atom instance for the lifetime of the component.

Pass an initial value to create a writable atom, or a getter function to
create a readonly derived atom. This mirrors createAtom, but only
creates the atom once per component mount.

### Type Parameters

#### T

`T`

### Parameters

#### getValue

(`prev?`) => `T`

#### options?

`AtomOptions`\<`T`\>

### Returns

`ReadonlyAtom`\<`T`\>

### Example

```tsx
function Counter() {
  const countAtom = useCreateAtom(0)
  const [count, setCount] = useAtom(countAtom)

  return (
    <button type="button" onClick={() => setCount((prev) => prev + 1)}>
      {count}
    </button>
  )
}
```

## Call Signature

```ts
function useCreateAtom<T>(initialValue, options?): Atom<T>;
```

Defined in: [preact-store/src/useCreateAtom.ts:31](https://github.com/TanStack/store/blob/main/packages/preact-store/src/useCreateAtom.ts#L31)

Creates a stable atom instance for the lifetime of the component.

Pass an initial value to create a writable atom, or a getter function to
create a readonly derived atom. This mirrors createAtom, but only
creates the atom once per component mount.

### Type Parameters

#### T

`T`

### Parameters

#### initialValue

`T`

#### options?

`AtomOptions`\<`T`\>

### Returns

`Atom`\<`T`\>

### Example

```tsx
function Counter() {
  const countAtom = useCreateAtom(0)
  const [count, setCount] = useAtom(countAtom)

  return (
    <button type="button" onClick={() => setCount((prev) => prev + 1)}>
      {count}
    </button>
  )
}
```
