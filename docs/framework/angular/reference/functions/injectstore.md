---
id: injectStore
title: injectStore
---

# Function: injectStore()

## injectStore(store, selector, options)

```ts
function injectStore<TState, TSelected>(
   store, 
   selector?, 
options?): Signal<TSelected>
```

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

• **store**: `Store`\<`TState`, `any`\>

• **selector?**

• **options?**: `CreateSignalOptions`\<`TSelected`\> & `object`

### Returns

`Signal`\<`TSelected`\>

### Defined in

[index.ts:19](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L19)

## injectStore(store, selector, options)

```ts
function injectStore<TState, TSelected>(
   store, 
   selector?, 
options?): Signal<TSelected>
```

### Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

### Parameters

• **store**: `Derived`\<`TState`, `any`\>

• **selector?**

• **options?**: `CreateSignalOptions`\<`TSelected`\> & `object`

### Returns

`Signal`\<`TSelected`\>

### Defined in

[index.ts:24](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L24)
