---
id: SelectionSource
title: SelectionSource
---

# Type Alias: SelectionSource\<T\>

```ts
type SelectionSource<T> = object;
```

Defined in: [packages/angular-store/src/injectSelector.ts:19](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L19)

## Type Parameters

### T

`T`

## Properties

### get()

```ts
get: () => T;
```

Defined in: [packages/angular-store/src/injectSelector.ts:20](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L20)

#### Returns

`T`

***

### subscribe()

```ts
subscribe: (listener) => object;
```

Defined in: [packages/angular-store/src/injectSelector.ts:21](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L21)

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
