import {
  Injector,
  assertInInjectionContext,
  effect,
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
  source: SelectionSource<TState> | (() => SelectionSource<TState>),
  selector: (state: NoInfer<TState>) => TSelected = (d) =>
    d as unknown as TSelected,
  options?: InjectSelectorOptions<TSelected>,
): Signal<TSelected> {
  const injector = resolveInjector(
    injectSelector,
    options?.injector,
  )

  return runInInjectionContext(injector, () => {
    const _source = typeof source === "function" ? source : (() => source)

    const slice = linkedSignal(() => selector(_source().get()), {
      equal: options?.compare,
    })

    effect(() => {
      const { unsubscribe } = _source().subscribe((state) => {
        slice.set(selector(state))
      })
      return unsubscribe
    })

    return slice.asReadonly()
  })
}
