---
id: DerivedFnProps
title: DerivedFnProps
---

# Interface: DerivedFnProps\<ArrType, UnwrappedArrT\>

## Type Parameters

• **ArrType** *extends* `ReadonlyArray`\<[`Derived`](../classes/derived.md)\<`any`\> \| [`Store`](../classes/store.md)\<`any`\>\> = `ReadonlyArray`\<`any`\>

• **UnwrappedArrT** *extends* `UnwrapReadonlyDerivedOrStoreArray`\<`ArrType`\> = `UnwrapReadonlyDerivedOrStoreArray`\<`ArrType`\>

## Properties

### currDepVals

```ts
currDepVals: UnwrappedArrT;
```

#### Defined in

[derived.ts:34](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L34)

***

### prevDepVals

```ts
prevDepVals: undefined | UnwrappedArrT;
```

#### Defined in

[derived.ts:33](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L33)

***

### prevVal

```ts
prevVal: unknown;
```

`undefined` if it's the first run

#### Defined in

[derived.ts:32](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L32)
