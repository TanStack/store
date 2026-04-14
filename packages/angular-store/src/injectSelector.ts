import {
  DestroyRef,
  Injector,
  assertInInjectionContext,
  inject,
  linkedSignal,
  runInInjectionContext,
} from '@angular/core'
import type { CreateSignalOptions, Signal } from '@angular/core'

export interface InjectSelectorOptions<TSelected> extends Omit<
  CreateSignalOptions<TSelected>,
  'equal'
> {
  compare?: (a: TSelected, b: TSelected) => boolean
  injector?: Injector
}

export type SelectionSource<T> = {
  get: () => T
  subscribe: (listener: (value: T) => void) => {
    unsubscribe: () => void
  }
}

function defaultCompare<T>(a: T, b: T) {
  return a === b
}

function resolveInjector(
  fn: (...args: Array<never>) => unknown,
  injector?: Injector,
) {
  if (!injector) {
    assertInInjectionContext(fn)
    return inject(Injector)
  }

  return injector
}

function createReadonlySelectionSignal<TSource, TSelected>(
  source: SelectionSource<TSource>,
  selector: (state: NoInfer<TSource>) => TSelected,
  options?: InjectSelectorOptions<TSelected>,
): Signal<TSelected> {
  const injector = resolveInjector(
    createReadonlySelectionSignal,
    options?.injector,
  )

  return runInInjectionContext(injector, () => {
    const destroyRef = inject(DestroyRef)
    const compare = options?.compare ?? defaultCompare
    const {
      injector: _injector,
      compare: _compare,
      ...signalOptions
    } = options ?? {}
    const slice = linkedSignal(() => selector(source.get()), {
      ...signalOptions,
      equal: compare,
    })

    const { unsubscribe } = source.subscribe((state) => {
      slice.set(selector(state))
    })

    destroyRef.onDestroy(() => {
      unsubscribe()
    })

    return slice.asReadonly()
  })
}

/**
 * Selects a slice of state from an atom or store and returns it as an Angular
 * signal.
 *
 * This is the primary Angular read hook for TanStack Store.
 *
 * @example
 * ```ts
 * readonly count = injectSelector(counterStore, (state) => state.count)
 * ```
 *
 * @example
 * ```ts
 * readonly doubled = injectSelector(countAtom, (value) => value * 2)
 * ```
 */
export function injectSelector<TState, TSelected = NoInfer<TState>>(
  source: SelectionSource<TState>,
  selector: (state: NoInfer<TState>) => TSelected = (d) =>
    d as unknown as TSelected,
  options?: InjectSelectorOptions<TSelected>,
): Signal<TSelected> {
  return createReadonlySelectionSignal(source, selector, options)
}
