import {
  DestroyRef,
  Injector,
  assertInInjectionContext,
  inject,
  linkedSignal,
  runInInjectionContext,
} from '@angular/core'
import type { Derived, Store } from '@tanstack/store'
import type { CreateSignalOptions, Signal } from '@angular/core'

export * from '@tanstack/store'

/**
 * @private
 */
type NoInfer<T> = [T][T extends any ? 0 : never]

export function injectStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
  options?: CreateSignalOptions<TSelected> & { injector?: Injector },
): Signal<TSelected>
export function injectStore<TState, TSelected = NoInfer<TState>>(
  store: Derived<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
  options?: CreateSignalOptions<TSelected> & { injector?: Injector },
): Signal<TSelected>
export function injectStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any> | Derived<TState, any>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as TSelected,
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
    const slice = linkedSignal(() => selector(store.state), options)

    const unsubscribe = store.subscribe(() => {
      slice.set(selector(store.state))
    })

    destroyRef.onDestroy(() => {
      unsubscribe()
    })

    return slice.asReadonly()
  })
}

function shallow<T>(objA: T, objB: T) {
  if (Object.is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false
    for (const [k, v] of objA) {
      if (!objB.has(k) || !Object.is(v, objB.get(k))) return false
    }
    return true
  }

  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false
    for (const v of objA) {
      if (!objB.has(v)) return false
    }
    return true
  }

  if (objA instanceof Date && objB instanceof Date) {
    if (objA.getTime() !== objB.getTime()) return false
    return true
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  if (keysA.length > 0) {
    for (const key of keysA) {
      if (
        !Object.prototype.hasOwnProperty.call(objB, key) ||
        !Object.is(objA[key as keyof T], objB[key as keyof T])
      ) {
        return false
      }
    }
    return true
  }

  if (keysA.length === 0) {
    const descriptorsA = Object.getOwnPropertyDescriptors(objA)
    const descriptorsB = Object.getOwnPropertyDescriptors(objB)

    const getterKeysA = Object.keys(descriptorsA).filter(
      (key) => descriptorsA[key]?.get !== undefined,
    )
    const getterKeysB = Object.keys(descriptorsB).filter(
      (key) => descriptorsB[key]?.get !== undefined,
    )

    if (getterKeysA.length !== getterKeysB.length) {
      return false
    }

    for (const key of getterKeysA) {
      if (
        !getterKeysB.includes(key) ||
        !Object.is(
          (objA as Record<string, unknown>)[key],
          (objB as Record<string, unknown>)[key],
        )
      ) {
        return false
      }
    }
  }

  return true
}
