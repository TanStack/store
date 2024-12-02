---
id: useStore
title: useStore
---

# Function: useStore()

## useStore(store, selector)

```ts
function useStore<TState, TSelected>(store, selector?): Readonly<Ref<TSelected>>
```

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

• **store**: `Store`\<`TState`, `any`\>

• **selector?**

### Returns

`Readonly`\<`Ref`\<`TSelected`\>\>

### Defined in

[index.ts:12](https://github.com/TanStack/store/blob/main/packages/vue-store/src/index.ts#L12)

## useStore(store, selector)

```ts
function useStore<TState, TSelected>(store, selector?): Readonly<Ref<TSelected>>
```

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

• **store**: `Derived`\<`TState`, `any`\>

• **selector?**

### Returns

`Readonly`\<`Ref`\<`TSelected`\>\>

### Defined in

[index.ts:16](https://github.com/TanStack/store/blob/main/packages/vue-store/src/index.ts#L16)
