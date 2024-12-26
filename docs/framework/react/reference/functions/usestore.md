---
id: useStore
title: useStore
---

# Function: useStore()

## Call Signature

```ts
function useStore<TState, TSelected>(store, selector?): TSelected
```

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

#### store

`Store`\<`TState`, `any`\>

#### selector?

(`state`) => `TSelected`

### Returns

`TSelected`

### Defined in

[index.ts:11](https://github.com/TanStack/store/blob/main/packages/react-store/src/index.ts#L11)

## Call Signature

```ts
function useStore<TState, TSelected>(store, selector?): TSelected
```

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

#### store

`Derived`\<`TState`, `any`\>

#### selector?

(`state`) => `TSelected`

### Returns

`TSelected`

### Defined in

[index.ts:15](https://github.com/TanStack/store/blob/main/packages/react-store/src/index.ts#L15)
