---
id: useStore
title: useStore
---

# Function: useStore()

## Call Signature

```ts
function useStore<TState, TSelected>(
   store, 
   selector?, 
   options?): object;
```

Defined in: [index.svelte.ts:14](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/index.svelte.ts#L14)

### Type Parameters

#### TState

`TState`

#### TSelected

`TSelected` = `NoInfer`\<`TState`\>

### Parameters

#### store

`Store`\<`TState`, `any`\>

#### selector?

(`state`) => `TSelected`

#### options?

`UseStoreOptions`\<`TSelected`\>

### Returns

`object`

#### current

```ts
readonly current: TSelected;
```

## Call Signature

```ts
function useStore<TState, TSelected>(
   store, 
   selector?, 
   options?): object;
```

Defined in: [index.svelte.ts:19](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/index.svelte.ts#L19)

### Type Parameters

#### TState

`TState`

#### TSelected

`TSelected` = `NoInfer`\<`TState`\>

### Parameters

#### store

`Derived`\<`TState`, `any`\>

#### selector?

(`state`) => `TSelected`

#### options?

`UseStoreOptions`\<`TSelected`\>

### Returns

`object`

#### current

```ts
readonly current: TSelected;
```
