---
id: WritableAtomSignal
title: WritableAtomSignal
---

# Interface: WritableAtomSignal()\<T\>

Defined in: [packages/angular-store/src/injectAtom.ts:21](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectAtom.ts#L21)

A callable signal that reads the current atom value when invoked and
exposes a `.set` method matching the atom's native setter contract.

This is the Angular-idiomatic return type for [injectAtom](../functions/injectAtom.md). It can
be used as a class property and called directly in templates.

## Example

```ts
readonly count = injectAtom(countAtom)

// read in template: {{ count() }}
// write in class:   this.count.set(5)
//                   this.count.set(prev => prev + 1)
```

## Type Parameters

### T

`T`

```ts
WritableAtomSignal(): T;
```

Defined in: [packages/angular-store/src/injectAtom.ts:23](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectAtom.ts#L23)

Read the current value.

## Returns

`T`

## Properties

### set

```ts
set: (fn) => void & (value) => void;
```

Defined in: [packages/angular-store/src/injectAtom.ts:25](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectAtom.ts#L25)

Set the atom value (accepts a direct value or an updater function).
