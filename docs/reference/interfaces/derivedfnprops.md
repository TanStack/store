---
id: DerivedFnProps
title: DerivedFnProps
---

# Interface: DerivedFnProps\<TArr, TUnwrappedArr\>

## Type Parameters

• **TArr** *extends* `ReadonlyArray`\<[`Derived`](../classes/derived.md)\<`any`\> \| [`Store`](../classes/store.md)\<`any`\>\> = `ReadonlyArray`\<`any`\>

• **TUnwrappedArr** *extends* `UnwrapReadonlyDerivedOrStoreArray`\<`TArr`\> = `UnwrapReadonlyDerivedOrStoreArray`\<`TArr`\>

## Properties

### currDepVals

```ts
currDepVals: TUnwrappedArr;
```

#### Defined in

[derived.ts:35](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L35)

***

### prevDepVals

```ts
prevDepVals: undefined | TUnwrappedArr;
```

#### Defined in

[derived.ts:34](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L34)

***

### prevVal

```ts
prevVal: unknown;
```

`undefined` if it's the first run

#### Defined in

[derived.ts:33](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L33)
