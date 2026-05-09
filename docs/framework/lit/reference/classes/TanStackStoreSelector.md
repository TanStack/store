---
id: TanStackStoreSelector
title: TanStackStoreSelector
---

# Class: TanStackStoreSelector\<TSource, TSelected\>

Defined in: [tan-stack-store-selector.ts:22](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-selector.ts#L22)

## Type Parameters

### TSource

`TSource`

### TSelected

`TSelected` = `NoInfer`\<`TSource`\>

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new TanStackStoreSelector<TSource, TSelected>(
   host, 
   getStore, 
   selector, 
options?): TanStackStoreSelector<TSource, TSelected>;
```

Defined in: [tan-stack-store-selector.ts:35](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-selector.ts#L35)

#### Parameters

##### host

`ReactiveControllerHost`

##### getStore

() => `SelectionSource`\<`TSource`\> \| `undefined`

##### selector

(`snapshot`) => `TSelected`

##### options?

[`UseSelectorOptions`](../interfaces/UseSelectorOptions.md)\<`TSelected`\>

#### Returns

`TanStackStoreSelector`\<`TSource`, `TSelected`\>

## Methods

### hostDisconnected()

```ts
hostDisconnected(): void;
```

Defined in: [tan-stack-store-selector.ts:72](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-selector.ts#L72)

Called when the host is disconnected from the component tree. For custom
element hosts, this corresponds to the `disconnectedCallback()` lifecycle,
which is called the host or an ancestor component is disconnected from the
document.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostDisconnected
```

***

### hostUpdate()

```ts
hostUpdate(): void;
```

Defined in: [tan-stack-store-selector.ts:48](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-selector.ts#L48)

Called during the client-side host update, just before the host calls
its own update.

Code in `update()` can depend on the DOM as it is not called in
server-side rendering.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostUpdate
```
