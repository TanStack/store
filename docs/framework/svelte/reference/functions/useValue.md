---
id: useValue
title: useValue
---

# Function: useValue()

```ts
function useValue<TValue>(source, options?): object;
```

Defined in: [svelte-store/src/index.svelte.ts:82](https://github.com/TanStack/store/blob/main/packages/svelte-store/src/index.svelte.ts#L82)

Subscribes to an atom or store and returns its whole current value through a
rune-friendly holder object.

## Type Parameters

### TValue

`TValue`

## Parameters

### source

`Atom`\<`TValue`\> | `ReadonlyAtom`\<`TValue`\> | `Store`\<`TValue`, `any`\> | `ReadonlyStore`\<`TValue`\>

### options?

[`UseSelectorOptions`](../interfaces/UseSelectorOptions.md)\<`TValue`\>

## Returns

`object`

### current

```ts
readonly current: TValue;
```

## Examples

```ts
const count = useValue(countAtom)
console.log(count.current)
```

```ts
const state = useValue(counterStore)
```
