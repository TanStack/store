import { InjectionToken, inject } from '@angular/core'
import type { Provider } from '@angular/core'

/**
 * Creates a typed Angular dependency-injection context for sharing a bundle of
 * atoms and stores with a component subtree.
 *
 * The returned `provideStoreContext` function accepts a factory that creates the
 * context value. Using a factory (rather than a static value) ensures each
 * component instance — and each SSR request — receives its own state, avoiding
 * cross-request pollution.
 *
 * Consumers call `injectStoreContext()` inside an injection context (typically a
 * constructor or field initializer) to retrieve the contextual atoms and stores,
 * then compose them with existing hooks like {@link injectSelector},
 * {@link injectSelector}, and {@link injectAtom}.
 *
 * @example
 * ```ts
 * const { provideStoreContext, injectStoreContext } = createStoreContext<{
 *   countAtom: Atom<number>
 *   totalsStore: Store<{ count: number }>
 * }>()
 *
 * // Parent component provides the context
 * @Component({
 *   providers: [
 *     provideStoreContext(() => ({
 *       countAtom: createAtom(0),
 *       totalsStore: new Store({ count: 0 }),
 *     })),
 *   ],
 *   template: `<child-cmp />`,
 * })
 * class ParentComponent {}
 *
 * // Child component consumes the context
 * @Component({ template: `{{ count() }}` })
 * class ChildComponent {
 *   private ctx = injectStoreContext()
 *   count = injectSelector(this.ctx.countAtom)
 * }
 * ```
 *
 * @throws When `injectStoreContext()` is called without a matching
 *   `provideStoreContext()` in a parent component's providers.
 */
export function createStoreContext<TValue extends object>(): {
  provideStoreContext: (factory: () => TValue) => Provider
  injectStoreContext: () => TValue
} {
  const token = new InjectionToken<TValue>('StoreContext')

  function provideStoreContext(factory: () => TValue): Provider {
    return { provide: token, useFactory: factory }
  }

  function injectStoreContext(): TValue {
    const value = inject(token, { optional: true })

    if (value === null) {
      throw new Error(
        "Missing StoreContext provider. Add provideStoreContext() to a parent component's providers array.",
      )
    }

    return value
  }

  return { provideStoreContext, injectStoreContext }
}
