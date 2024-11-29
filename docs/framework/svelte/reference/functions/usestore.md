---
id: useStore
title: useStore
---

# Function: useStore()

```ts
function useStore<TState, TSelected, TUpdater>(store, selector): object
```

## Type Parameters

• **TState**

• **TSelected** = `NoInfer`\<`TState`\>

• **TUpdater** *extends* `AnyUpdater` = `AnyUpdater`

## Parameters

• **store**: `Store`\<`TState`, `TUpdater`\>

• **selector** = `...`

## Returns

`object`

### current

#### Get Signature

```ts
get current(): TSelected
```

##### Returns

`TSelected`

## Defined in

[index.svelte.ts:10](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/index.svelte.ts#L10)
