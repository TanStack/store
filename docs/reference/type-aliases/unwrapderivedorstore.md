---
id: UnwrapDerivedOrStore
title: UnwrapDerivedOrStore
---

# Type Alias: UnwrapDerivedOrStore\<T\>

```ts
type UnwrapDerivedOrStore<T>: T extends Derived<infer InnerD> ? InnerD : T extends Store<infer InnerS> ? InnerS : never;
```

## Type Parameters

• **T**

## Defined in

[derived.ts:4](https://github.com/TanStack/store/blob/main/packages/store/src/derived.ts#L4)
