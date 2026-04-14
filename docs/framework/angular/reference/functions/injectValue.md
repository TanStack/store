---
id: injectValue
title: injectValue
---

# Function: injectValue()

```ts
function injectValue<TValue>(source, options?): Signal<TValue>;
```

Defined in: [packages/angular-store/src/injectValue.ts:21](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectValue.ts#L21)

Returns the current value signal for an atom or store.

This is the whole-value counterpart to [injectSelector](injectSelector.md).

## Type Parameters

### TValue

`TValue`

## Parameters

### source

`Atom`\<`TValue`\> | `ReadonlyAtom`\<`TValue`\> | `Store`\<`TValue`, `any`\> | `ReadonlyStore`\<`TValue`\>

### options?

[`InjectSelectorOptions`](../interfaces/InjectSelectorOptions.md)\<`TValue`\>

## Returns

`Signal`\<`TValue`\>

## Examples

```ts
readonly count = injectValue(countAtom)
```

```ts
readonly state = injectValue(counterStore)
```
