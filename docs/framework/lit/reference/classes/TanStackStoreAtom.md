---
id: TanStackStoreAtom
title: TanStackStoreAtom
---

# Class: TanStackStoreAtom\<TValue\>

Defined in: [tan-stack-store-atom.ts:29](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-atom.ts#L29)

Subscribes a Lit host to a writable atom and exposes its current value
along with a stable setter.

Use this when an element needs to both read and update the same writable
atom. The host will only re-render when the atom's value actually changes
(according to the configured `compare` function).

## Example

```ts
class CounterEl extends LitElement {
  #count = new TanStackAtom(this, () => countAtom)

  render() {
    return html`
      <button @click=${() => this.#count.set((prev) => prev + 1)}>
        ${this.#count.value}
      </button>
    `
  }
}
```

## Type Parameters

### TValue

`TValue`

## Constructors

### Constructor

```ts
new TanStackStoreAtom<TValue>(
   host, 
   getAtom, 
options?): TanStackStoreAtom<TValue>;
```

Defined in: [tan-stack-store-atom.ts:32](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-atom.ts#L32)

#### Parameters

##### host

`ReactiveControllerHost`

##### getAtom

() => `Atom`\<`TValue`\> \| `undefined`

##### options?

[`UseSelectorOptions`](../interfaces/UseSelectorOptions.md)\<`TValue`\>

#### Returns

`TanStackStoreAtom`\<`TValue`\>

## Accessors

### value

#### Get Signature

```ts
get value(): TValue | undefined;
```

Defined in: [tan-stack-store-atom.ts:48](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-atom.ts#L48)

##### Returns

`TValue` \| `undefined`

## Methods

### set()

#### Call Signature

```ts
set(value): void;
```

Defined in: [tan-stack-store-atom.ts:52](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-atom.ts#L52)

##### Parameters

###### value

`TValue`

##### Returns

`void`

#### Call Signature

```ts
set(updater): void;
```

Defined in: [tan-stack-store-atom.ts:53](https://github.com/TanStack/store/blob/main/packages/lit-store/src/tan-stack-store-atom.ts#L53)

##### Parameters

###### updater

(`prev`) => `TValue`

##### Returns

`void`
