---
id: useStore
title: useStore
---

# Function: useStore()

## useStore(store, selector)

```ts
function useStore<TState, TSelected>(store, selector?): Accessor<TSelected>
```

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

• **store**: `Store`\<`TState`, `any`\>

• **selector?**

### Returns

`Accessor`\<`TSelected`\>

### Defined in

[index.tsx:13](https://github.com/TanStack/store/blob/main/packages/solid-store/src/index.tsx#L13)

## useStore(store, selector)

```ts
function useStore<TState, TSelected>(store, selector?): Accessor<TSelected>
```

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

• **store**: `Derived`\<`TState`, `any`\>

• **selector?**

### Returns

`Accessor`\<`TSelected`\>

### Defined in

[index.tsx:17](https://github.com/TanStack/store/blob/main/packages/solid-store/src/index.tsx#L17)
