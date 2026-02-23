import {
  DestroyRef,
  Injector,
  assertInInjectionContext,
  inject,
  linkedSignal,
  runInInjectionContext,
} from '@angular/core'
import { shallow } from './shallow'
import type { Atom, ReadonlyAtom } from '@tanstack/store'
import type { CreateSignalOptions, Signal } from '@angular/core'

type StoreContext = Record<string, unknown>

export function injectStore<TState, TSelected = NoInfer<TState>>(
  store: Atom<TState>,
  selector?: (state: NoInfer<TState>) => TSelected,
  options?: CreateSignalOptions<TSelected> & { injector?: Injector },
): Signal<TSelected>
export function injectStore<TState, TSelected = NoInfer<TState>>(
  store: Atom<TState> | ReadonlyAtom<TState>,
  selector?: (state: NoInfer<TState>) => TSelected,
  options?: CreateSignalOptions<TSelected> & { injector?: Injector },
): Signal<TSelected>
export function injectStore<
  TState extends StoreContext,
  TSelected = NoInfer<TState>,
>(
  store: Atom<TState> | ReadonlyAtom<TState>,
  selector: (state: NoInfer<TState>) => TSelected = (d) =>
    d as unknown as TSelected,
  options: CreateSignalOptions<TSelected> & { injector?: Injector } = {
    equal: shallow,
  },
): Signal<TSelected> {
  !options.injector && assertInInjectionContext(injectStore)

  if (!options.injector) {
    options.injector = inject(Injector)
  }

  return runInInjectionContext(options.injector, () => {
    const destroyRef = inject(DestroyRef)
    const slice = linkedSignal(() => selector(store.get()), options)

    const { unsubscribe } = store.subscribe((s) => {
      slice.set(selector(s))
    })

    destroyRef.onDestroy(() => {
      unsubscribe()
    })

    return slice.asReadonly()
  })
}
