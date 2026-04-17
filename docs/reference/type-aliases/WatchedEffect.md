---
id: WatchedEffect
title: WatchedEffect
---

# Type Alias: WatchedEffect()

```ts
type WatchedEffect = () => () => void | void | undefined;
```

Defined in: [atom.ts:33](https://github.com/justjake/store/blob/main/packages/store/src/atom.ts#L33)

Called when the atom is watched.
Returns a cleanup function that will be called when the atom is unwatched.

## Returns

() => `void` \| `void` \| `undefined`
