---
id: useStore
title: useStore
---

# Function: useStore()

## useStore(store, selector)

```ts
function useStore<TState, TSelected>(store, selector?): object
```

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

• **store**: `Store`\<`TState`, `any`\>

• **selector?**

### Returns

`object`

#### current

```ts
readonly current: TSelected;
```

### Defined in

[index.svelte.ts:10](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/index.svelte.ts#L10)

## useStore(store, selector)

```ts
function useStore<TState, TSelected>(store, selector?): object
```

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

• **store**: `Derived`\<`TState`, `any`\>

• **selector?**

### Returns

`object`

#### current

```ts
readonly current: TSelected;
```

### Defined in

[index.svelte.ts:14](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/index.svelte.ts#L14)
