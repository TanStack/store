---
id: $StoreDevtoolsBridge
title: $StoreDevtoolsBridge
---

# Interface: $StoreDevtoolsBridge

Defined in: [devtoolsBridge.ts:4](https://github.com/TanStack/store/blob/main/packages/store/src/devtoolsBridge.ts#L4)

## Properties

### mountStore()?

```ts
optional mountStore: (atom) => void;
```

Defined in: [devtoolsBridge.ts:10](https://github.com/TanStack/store/blob/main/packages/store/src/devtoolsBridge.ts#L10)

Be descriptive here! It's important that the function call can be easily reasoned about when someone is confused.

As far as parameters go, keep it vague. Core should do as little calculation as possible.

#### Parameters

##### atom

[`InternalBaseAtom`](../../../../interfaces/InternalBaseAtom.md)\<`any`\> | [`InternalReadonlyAtom`](../../../../interfaces/InternalReadonlyAtom.md)\<`any`\>

#### Returns

`void`
