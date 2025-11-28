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

Defined in: [index.ts:15](https://github.com/TanStack/store/blob/main/packages/react-store/src/index.ts#L15)

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

Defined in: [index.ts:20](https://github.com/TanStack/store/blob/main/packages/react-store/src/index.ts#L20)

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
