---
id: DerivedFnProps
title: DerivedFnProps
---

# Interface: DerivedFnProps\<TState, ArrType, UnwrappedArrT\>

## Type Parameters

• **TState**

• **ArrType** *extends* `ReadonlyArray`\<[`Derived`](../classes/derived.md)\<`any`\> \| [`Store`](../classes/store.md)\<`any`\>\> = `ReadonlyArray`\<`any`\>

• **UnwrappedArrT** *extends* `UnwrapReadonlyDerivedOrStoreArray`\<`ArrType`\> = `UnwrapReadonlyDerivedOrStoreArray`\<`ArrType`\>

## Properties

### currDepVals

```ts
currDepVals: UnwrappedArrT;
```

#### Defined in

[derived.ts:31](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L31)

***

### prevDepVals

```ts
prevDepVals: undefined | UnwrappedArrT;
```

#### Defined in

[derived.ts:28](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L28)

***

### prevVal

```ts
prevVal: undefined | TState;
```

#### Defined in

[derived.ts:30](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L30)
