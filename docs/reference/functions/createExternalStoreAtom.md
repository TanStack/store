---
id: createExternalStoreAtom
title: createExternalStoreAtom
---

# Function: createExternalStoreAtom()

```ts
function createExternalStoreAtom<T>(
   getSnapshot, 
   subscribe, 
options?): ReadonlyAtom<T>;
```

Defined in: [atom.ts:190](https://github.com/justjake/store/blob/main/packages/store/src/atom.ts#L190)

Like React.useSyncExternalStore: pulls external state into an atom.
Thic can be used for interoperating with other state management libraries.

```ts
import * as redux from "redux"

const reduxStore = redux.createStore((state: number, action: number) => state + action, 0)
const atom = createExternalStoreAtom(reduxStore.getState, reduxStore.subscribe)

const timesTwo = createAtom(() => atom.get() * 2)
timesTwo.subscribe((value) => {
  console.log('timesTwo: ', value)
})

reduxStore.dispatch(1)
// timesTwo: 2
reduxStore.dispatch(1)
// timesTwo: 4

## Type Parameters

### T

`T`

## Parameters

### getSnapshot

() => `T`

### subscribe

(`onStoreChange`) => () => `void`

### options?

[`AtomOptions`](../interfaces/AtomOptions.md)\<`T`\>

## Returns

[`ReadonlyAtom`](../interfaces/ReadonlyAtom.md)\<`T`\>
