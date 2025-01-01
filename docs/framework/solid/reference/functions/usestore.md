---
id: useStore
title: useStore
---

# Function: useStore()

## Call Signature

```ts
function useStore<TState, TSelected>(store, selector?): Accessor<TSelected>
```

Defined in: [index.tsx:13](https://github.com/TanStack/store/blob/main/packages/solid-store/src/index.tsx#L13)

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

#### store

`Store`\<`TState`, `any`\>

#### selector?

(`state`) => `TSelected`

### Returns

`Accessor`\<`TSelected`\>

## Call Signature

```ts
function useStore<TState, TSelected>(store, selector?): Accessor<TSelected>
```

Defined in: [index.tsx:17](https://github.com/TanStack/store/blob/main/packages/solid-store/src/index.tsx#L17)

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

#### store

`Derived`\<`TState`, `any`\>

#### selector?

(`state`) => `TSelected`

### Returns

`Accessor`\<`TSelected`\>
