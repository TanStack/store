---
id: useCreateAtom
title: useCreateAtom
---

# Function: useCreateAtom()

## Call Signature

```ts
function useCreateAtom<T>(getValue, options?): ReadonlyAtom<T>;
```

Defined in: octane-store/src/useCreateAtom.ts:18

Creates a stable atom instance for the lifetime of the component.

Pass an initial value to create a writable atom, or a getter function to
create a readonly derived atom. This hook mirrors the overloads from
createAtom, but ensures the atom is only created once per mount.

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
const countAtom = useCreateAtom(0)
```

## Call Signature

```ts
function useCreateAtom<T>(initialValue, options?): Atom<T>;
```

Defined in: octane-store/src/useCreateAtom.ts:22

Creates a stable atom instance for the lifetime of the component.

Pass an initial value to create a writable atom, or a getter function to
create a readonly derived atom. This hook mirrors the overloads from
createAtom, but ensures the atom is only created once per mount.

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
const countAtom = useCreateAtom(0)
```
