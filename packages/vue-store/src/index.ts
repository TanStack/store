import type { AnyUpdater, Store } from '@tanstack/store'
import { readonly, type Ref, ref, toRaw, watch } from 'vue-demi'

export * from '@tanstack/store'

export type NoInfer<T> = [T][T extends any ? 0 : never]

export function useStore<
  TState,
  TSelected = NoInfer<TState>,
  TUpdater extends AnyUpdater = AnyUpdater,
>(
  store: Store<TState, TUpdater>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
): Readonly<Ref<TSelected>> {
  const slice = ref(selector(store.state)) as Ref<TSelected>

  watch(
    () => store,
    (value, _oldValue, onCleanup) => {
      const unsub = value.subscribe(() => {
        const data = selector(value.state)
        if (shallow(toRaw(slice.value), data)) {
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

  const keysA = Object.keys(objA)
  if (keysA.length !== Object.keys(objB).length) {
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

// Force a manual release of the package
// @ts-ignore
const manualRelease = 1;
