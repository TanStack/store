import {
  DestroyRef,
  Injector,
  assertInInjectionContext,
  inject,
  linkedSignal,
  runInInjectionContext,
} from '@angular/core'
import type { Atom, ReadonlyAtom } from '@tanstack/store'
import type { CreateSignalOptions, Signal } from '@angular/core'

type StoreContext = Record<string, unknown>

export * from '@tanstack/store'

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

  const tagA = getToStringTag(objA)
  const tagB = getToStringTag(objB)
  const isTemporal =
    tagA !== undefined &&
    tagB !== undefined &&
    tagA === tagB &&
    tagA.startsWith('Temporal.')

  if (isTemporal && hasEquals(objA) && hasEquals(objB)) {
    try {
      return objA.equals(objB)
    } catch {
      return false
    }
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

function hasEquals<TValue>(
  value: TValue,
): value is TValue & { equals: (other: unknown) => boolean } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'equals' in (value as object) &&
    typeof (value as any).equals === 'function'
  )
}

function getToStringTag(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const tag = (value as any)[Symbol.toStringTag]
  return typeof tag === 'string' ? tag : undefined
}
