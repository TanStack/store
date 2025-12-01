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
   options?): TSelected;
```

Defined in: [index.ts:41](https://github.com/TanStack/store/blob/main/packages/preact-store/src/index.ts#L41)

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

`TSelected`

## Call Signature

```ts
function useStore<TState, TSelected>(
   store, 
   selector?, 
   options?): TSelected;
```

Defined in: [index.ts:46](https://github.com/TanStack/store/blob/main/packages/preact-store/src/index.ts#L46)

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

`TSelected`
