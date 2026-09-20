---
id: SelectionSource
title: SelectionSource
---

```ts
type SelectionSource<T> = object;
```

Defined in: [packages/angular-store/src/injectSelector.ts:21](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L21)

## Type Parameters

### T

`T`

## Properties

### get()

```ts
get: () => T;
```

Defined in: [packages/angular-store/src/injectSelector.ts:22](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L22)

#### Returns

`T`

***

### subscribe()

```ts
subscribe: (listener) => object;
```

Defined in: [packages/angular-store/src/injectSelector.ts:23](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L23)

#### Parameters

##### listener

(`value`) => `void`

#### Returns

`object`

##### unsubscribe()

```ts
unsubscribe: () => void;
```

###### Returns

`void`
