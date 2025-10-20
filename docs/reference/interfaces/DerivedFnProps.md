---
id: DerivedFnProps
title: DerivedFnProps
---

# Interface: DerivedFnProps\<TArr, TUnwrappedArr\>

Defined in: [derived.ts:30](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L30)

## Type Parameters

### TArr

`TArr` *extends* `ReadonlyArray`\<
  \| [`Derived`](../../classes/Derived.md)\<`any`\>
  \| [`Store`](../../classes/Store.md)\<`any`\>\> = `ReadonlyArray`\<`any`\>

### TUnwrappedArr

`TUnwrappedArr` *extends* `UnwrapReadonlyDerivedOrStoreArray`\<`TArr`\> = `UnwrapReadonlyDerivedOrStoreArray`\<`TArr`\>

## Properties

### currDepVals

```ts
currDepVals: TUnwrappedArr;
```

Defined in: [derived.ts:42](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L42)

***

### prevDepVals

```ts
prevDepVals: TUnwrappedArr | undefined;
```

Defined in: [derived.ts:41](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L41)

***

### prevVal

```ts
prevVal: unknown;
```

Defined in: [derived.ts:40](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L40)

`undefined` if it's the first run
