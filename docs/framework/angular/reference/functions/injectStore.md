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
options?): Signal<TSelected>;
```

Defined in: [index.ts:21](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L21)

### Type Parameters

#### TState

`TState`

#### TSelected

`TSelected` = `NoInfer`\<`TState`\>

### Parameters

#### store

`Atom`\<`TState`\>

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
options?): Signal<TSelected>;
```

Defined in: [index.ts:26](https://github.com/TanStack/store/blob/main/packages/angular-store/src/index.ts#L26)

### Type Parameters

#### TState

`TState`

#### TSelected

`TSelected` = `NoInfer`\<`TState`\>

### Parameters

#### store

`Atom`\<`TState`\> | `ReadonlyAtom`\<`TState`\>

#### selector?

(`state`) => `TSelected`

#### options?

`CreateSignalOptions`\<`TSelected`\> & `object`

### Returns

`Signal`\<`TSelected`\>
