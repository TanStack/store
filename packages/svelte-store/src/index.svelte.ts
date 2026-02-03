import type { Derived, Store } from '@tanstack/store'

export * from '@tanstack/store'

/**
 * @private
 */
export type NoInfer<T> = [T][T extends any ? 0 : never]
type EqualityFn<T> = (objA: T, objB: T) => boolean
interface UseStoreOptions<T> {
  equal?: EqualityFn<T>
}

export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
  options?: UseStoreOptions<TSelected>,
): { readonly current: TSelected }
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Derived<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
  options?: UseStoreOptions<TSelected>,
): { readonly current: TSelected }
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any> | Derived<TState, any>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
  options: UseStoreOptions<TSelected> = {},
): { readonly current: TSelected } {
  const equal = options.equal ?? shallow
  let slice = $state(selector(store.state))

  $effect(() => {
    const unsub = store.subscribe(() => {
      const data = selector(store.state)
      if (equal(slice, data)) {
        return
      }
      slice = data
    })

    return unsub
  })

  return {
    get current() {
      return slice
    },
  }
}

export function shallow<T>(objA: T, objB: T) {
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

  /**
   * Temporal branding note:
   * Temporal types (native or polyfill) define `Symbol.toStringTag` values like
   * `"Temporal.PlainDate"` as part of the TC39 Temporal spec, which makes this
   * check reliable across realms/polyfills (unlike `instanceof`).
   *
   * See:
   * - https://tc39.es/proposal-temporal/
   * - https://tc39.es/proposal-temporal/docs/plaindate.html
   */
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
