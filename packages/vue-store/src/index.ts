import { readonly, ref, toRaw, watch } from 'vue-demi'
import type { Derived, Store } from '@tanstack/store'
import type { Ref } from 'vue-demi'

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
): Readonly<Ref<TSelected>>
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Derived<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
  options?: UseStoreOptions<TSelected>,
): Readonly<Ref<TSelected>>
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any> | Derived<TState, any>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
  options: UseStoreOptions<TSelected> = {},
): Readonly<Ref<TSelected>> {
  const slice = ref(selector(store.state)) as Ref<TSelected>
  const equal = options.equal ?? shallow

  watch(
    () => store,
    (value, _oldValue, onCleanup) => {
      const unsub = value.subscribe(() => {
        const data = selector(value.state)
        if (equal(toRaw(slice.value), data)) {
          return
        }
        slice.value = data
      })

      onCleanup(() => {
        unsub()
      })
    },
    { immediate: true },
  )

  return readonly(slice) as never
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

  const keysA = Object.keys(objA)
  if (keysA.length !== Object.keys(objB).length) {
    return false
  }

  // Many "value objects" (e.g. Temporal) have no enumerable keys, which would
  // otherwise make any two instances appear "shallow equal". Only treat
  // keyless values as equal when both are plain objects or both are arrays.
  if (keysA.length === 0) {
    const aIsPlain = isPlainObject(objA)
    const bIsPlain = isPlainObject(objB)
    const aIsArray = Array.isArray(objA)
    const bIsArray = Array.isArray(objB)

    if ((aIsPlain && bIsPlain) || (aIsArray && bIsArray)) {
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

    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i] as string) ||
      !Object.is(objA[keysA[i] as keyof T], objB[keysA[i] as keyof T])
    ) {
      return false
    }
  }
  return true
}

function isPlainObject(value: unknown): value is object {
  if (typeof value !== 'object' || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
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
