---
id: InternalReadonlyAtom
title: InternalReadonlyAtom
---

# Interface: InternalReadonlyAtom\<T\>

Defined in: [types.ts:53](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L53)

## Extends

- [`InternalBaseAtom`](InternalBaseAtom.md)\<`T`\>.`ReactiveNode`

## Type Parameters

### T

`T`

## Properties

### \_snapshot

```ts
_snapshot: T;
```

Defined in: [types.ts:37](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L37)

**`Internal`**

#### Inherited from

[`InternalBaseAtom`](InternalBaseAtom.md).[`_snapshot`](InternalBaseAtom.md#_snapshot)

***

### \_update()

```ts
_update: (getValue?) => boolean;
```

Defined in: [types.ts:39](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L39)

**`Internal`**

#### Parameters

##### getValue?

`T` | (`snapshot`) => `T`

#### Returns

`boolean`

#### Inherited from

[`InternalBaseAtom`](InternalBaseAtom.md).[`_update`](InternalBaseAtom.md#_update)

***

### deps?

```ts
optional deps: Link;
```

Defined in: [alien.ts:6](https://github.com/TanStack/store/blob/main/packages/store/src/alien.ts#L6)

#### Inherited from

```ts
ReactiveNode.deps
```

***

### depsTail?

```ts
optional depsTail: Link;
```

Defined in: [alien.ts:7](https://github.com/TanStack/store/blob/main/packages/store/src/alien.ts#L7)

#### Inherited from

```ts
ReactiveNode.depsTail
```

***

### flags

```ts
flags: ReactiveFlags;
```

Defined in: [alien.ts:10](https://github.com/TanStack/store/blob/main/packages/store/src/alien.ts#L10)

#### Inherited from

```ts
ReactiveNode.flags
```

***

### get()

```ts
get: () => T;
```

Defined in: [types.ts:30](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L30)

#### Returns

`T`

#### Inherited from

[`InternalBaseAtom`](InternalBaseAtom.md).[`get`](InternalBaseAtom.md#get)

***

### subs?

```ts
optional subs: Link;
```

Defined in: [alien.ts:8](https://github.com/TanStack/store/blob/main/packages/store/src/alien.ts#L8)

#### Inherited from

```ts
ReactiveNode.subs
```

***

### subscribe

```ts
subscribe: (observer) => Subscription & (next, error?, complete?) => Subscription;
```

Defined in: [types.ts:21](https://github.com/TanStack/store/blob/main/packages/store/src/types.ts#L21)

#### Inherited from

[`InternalBaseAtom`](InternalBaseAtom.md).[`subscribe`](InternalBaseAtom.md#subscribe)

***

### subsTail?

```ts
optional subsTail: Link;
```

Defined in: [alien.ts:9](https://github.com/TanStack/store/blob/main/packages/store/src/alien.ts#L9)

#### Inherited from

```ts
ReactiveNode.subsTail
```
