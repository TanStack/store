---
id: __storeToDerived
title: __storeToDerived
---

# Variable: \_\_storeToDerived

```ts
const __storeToDerived: WeakMap<Store<unknown, (cb) => unknown>, Set<Derived<unknown, readonly any[]>>>;
```

This is here to solve the pyramid dependency problem where:
      A
     / \
    B   C
     \ /
      D

Where we deeply traverse this tree, how do we avoid D being recomputed twice; once when B is updated, once when C is.

To solve this, we create linkedDeps that allows us to sync avoid writes to the state until all of the deps have been
resolved.

This is a record of stores, because derived stores are not able to write values to, but stores are

## Defined in

[scheduler.ts:19](https://github.com/TanStack/store/blob/main/packages/store/src/scheduler.ts#L19)