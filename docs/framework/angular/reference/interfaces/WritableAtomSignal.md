---
id: WritableAtomSignal
title: WritableAtomSignal
---

Defined in: [packages/angular-store/src/injectAtom.ts:22](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectAtom.ts#L22)

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

## Extends

- `Signal`\<`T`\>

## Type Parameters

### T

`T`

```ts
WritableAtomSignal(): T;
```

Defined in: [packages/angular-store/src/injectAtom.ts:22](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectAtom.ts#L22)

A callable signal that reads the current atom value when invoked and
exposes a `.set` method matching the atom's native setter contract.

This is the Angular-idiomatic return type for [injectAtom](../functions/injectAtom.md). It can
be used as a class property and called directly in templates.

## Returns

`T`

## Example

```ts
readonly count = injectAtom(countAtom)

// read in template: {{ count() }}
// write in class:   this.count.set(5)
//                   this.count.set(prev => prev + 1)
```

## Properties

### \[SIGNAL\]

```ts
[SIGNAL]: unknown;
```

Defined in: node\_modules/.pnpm/@angular+core@22.0.7\_@angular+compiler@22.0.7\_rxjs@7.8.2\_zone.js@0.16.1/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:75

#### Inherited from

```ts
Signal.[SIGNAL]
```

***

### set

```ts
set: (fn) => void & (value) => void;
```

Defined in: [packages/angular-store/src/injectAtom.ts:24](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectAtom.ts#L24)

Set the atom value (accepts a direct value or an updater function).
