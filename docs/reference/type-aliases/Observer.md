---
id: Observer
title: Observer
---

# Type Alias: Observer\<T\>

```ts
type Observer<T> = object;
```

Defined in: [types.ts:10](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L10)

## Type Parameters

### T

`T`

## Properties

### complete()?

```ts
optional complete: () => void;
```

Defined in: [types.ts:13](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L13)

#### Returns

`void`

***

### error()?

```ts
optional error: (err) => void;
```

Defined in: [types.ts:12](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L12)

#### Parameters

##### err

`unknown`

#### Returns

`void`

***

### next()?

```ts
optional next: (value) => void;
```

Defined in: [types.ts:11](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L11)

#### Parameters

##### value

`T`

#### Returns

`void`
