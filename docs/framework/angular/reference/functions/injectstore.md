---
id: injectStore
title: injectStore
---

# Function: injectStore()

## Call Signature

```ts
function injectStore<TState, TSelected>(
   store, 
   selector?, 
options?): Signal<TSelected>
```

Defined in: [index.ts:19](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L19)

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

#### store

`Store`\<`TState`, `any`\>

#### selector?

(`state`) => `TSelected`

#### options?

`CreateSignalOptions`\<`TSelected`\> & `object`

### Returns

`Signal`\<`TSelected`\>

## Call Signature

```ts
function injectStore<TState, TSelected>(
   store, 
   selector?, 
options?): Signal<TSelected>
```

Defined in: [index.ts:24](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L24)

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

#### store

`Derived`\<`TState`, `any`\>

#### selector?

(`state`) => `TSelected`

#### options?

`CreateSignalOptions`\<`TSelected`\> & `object`

### Returns

`Signal`\<`TSelected`\>
