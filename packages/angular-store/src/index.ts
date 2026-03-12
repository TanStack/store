import {
  Injector,
  assertInInjectionContext,
  effect,
  inject,
  linkedSignal,
  runInInjectionContext,
} from '@angular/core'
import type { Atom, ReadonlyAtom } from '@tanstack/store'
import type { CreateSignalOptions, Signal } from '@angular/core'

export * from '@tanstack/store'

export function injectStore<TState, TSelected = NoInfer<TState>>(
  storeOrStoreSignal:
    | Atom<TState>
    | ReadonlyAtom<TState>
    | (() => Atom<TState> | ReadonlyAtom<TState>),
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
    const storeSignal =
      typeof storeOrStoreSignal === 'function'
        ? storeOrStoreSignal
        : () => storeOrStoreSignal

    const slice = linkedSignal(() => selector(storeSignal().get()), options)

    effect((onCleanup) => {
      const { unsubscribe } = storeSignal().subscribe((s) => {
        slice.set(selector(s))
      })
      onCleanup(() => unsubscribe())
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
  if (keysA.length !== Object.keys(objB).length) {
    return false
  }

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
