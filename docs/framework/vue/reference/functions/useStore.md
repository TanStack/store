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
options?): Readonly<Ref<TSelected>>;
```

Defined in: [index.ts:16](https://github.com/TanStack/store/blob/main/packages/vue-store/src/index.ts#L16)

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

`Readonly`\<`Ref`\<`TSelected`\>\>

## Call Signature

```ts
function useStore<TState, TSelected>(
   store, 
   selector?, 
options?): Readonly<Ref<TSelected>>;
```

Defined in: [index.ts:21](https://github.com/TanStack/store/blob/main/packages/vue-store/src/index.ts#L21)

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

`Readonly`\<`Ref`\<`TSelected`\>\>
