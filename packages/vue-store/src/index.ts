import type { AnyUpdater, Store } from '@tanstack/store'
import { readonly, type Ref, ref, toRaw, watch } from 'vue-demi'

export * from '@tanstack/store'
import { shallow } from '@tanstack/shallow'

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
