---
id: createStoreContext
title: createStoreContext
---

# Function: createStoreContext()

```ts
function createStoreContext<TValue>(): object;
```

Defined in: [packages/angular-store/src/createStoreContext.ts:48](https://github.com/TanStack/store/blob/main/packages/angular-store/src/createStoreContext.ts#L48)

Creates a typed Angular dependency-injection context for sharing a bundle of
atoms and stores with a component subtree.

The returned `provideStoreContext` function accepts a factory that creates the
context value. Using a factory (rather than a static value) ensures each
component instance — and each SSR request — receives its own state, avoiding
cross-request pollution.

Consumers call `injectStoreContext()` inside an injection context (typically a
constructor or field initializer) to retrieve the contextual atoms and stores,
then compose them with existing hooks like [injectSelector](injectSelector.md),
[injectValue](injectValue.md), and [injectAtom](injectAtom.md).

## Type Parameters

### TValue

`TValue` *extends* `object`

## Returns

`object`

### injectStoreContext()

```ts
injectStoreContext: () => TValue;
```

#### Returns

`TValue`

### provideStoreContext()

```ts
provideStoreContext: (factory) => Provider;
```

#### Parameters

##### factory

() => `TValue`

#### Returns

`Provider`

## Example

```ts
const { provideStoreContext, injectStoreContext } = createStoreContext<{
  countAtom: Atom<number>
  totalsStore: Store<{ count: number }>
}>()

// Parent component provides the context
@Component({
  providers: [
    provideStoreContext(() => ({
      countAtom: createAtom(0),
      totalsStore: new Store({ count: 0 }),
    })),
  ],
  template: `<child-cmp />`,
})
class ParentComponent {}

// Child component consumes the context
@Component({ template: `{{ count() }}` })
class ChildComponent {
  private ctx = injectStoreContext()
  count = injectValue(this.ctx.countAtom)
}
```

## Throws

When `injectStoreContext()` is called without a matching
  `provideStoreContext()` in a parent component's providers.
