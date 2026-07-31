---
id: TanStackStoreSelector
title: TanStackStoreSelector
---

# Class: TanStackStoreSelector\<TSource, TSelected\>

Defined in: [tan-stack-store-selector.ts:59](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-selector.ts#L59)

Subscribes a Lit host to a TanStack Store and exposes a selected slice of its state.

The host will only re-render when the selected value actually changes
(according to the configured `compare` function).

## Examples

```ts
class UserNameEl extends LitElement {
  #name = new TanStackStoreSelector(
    this,
    () => userStore,
    (snapshot) => snapshot.name,
  )

  render() {
    return html`<p>${this.#name.value}</p>`
  }
}
```

```ts
class UserNameEl extends LitElement {
  _ = new TanStackStoreAtom(
    this,
    () => userStore,
    (snapshot) => snapshot.name,
  )

  render() {
    return html`<p>${userStore.state.name}</p>`
  }
}
```

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

Defined in: [tan-stack-store-selector.ts:72](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-selector.ts#L72)

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

## Accessors

### value

#### Get Signature

```ts
get value(): TSelected | undefined;
```

Defined in: [tan-stack-store-selector.ts:85](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-selector.ts#L85)

##### Returns

`TSelected` \| `undefined`

## Methods

### hostDisconnected()

```ts
hostDisconnected(): void;
```

Defined in: [tan-stack-store-selector.ts:113](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-selector.ts#L113)

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

Defined in: [tan-stack-store-selector.ts:89](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-selector.ts#L89)

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
