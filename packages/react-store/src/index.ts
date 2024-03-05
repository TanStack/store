import { useMemo, useSyncExternalStore } from 'react'
import type { AnyUpdater, Store } from '@tanstack/store'

export * from '@tanstack/store'

export type NoInfer<T> = [T][T extends any ? 0 : never]

/*
This modification is totally inspired by the work carried out in version 5 of zustand

https://github.com/pmndrs/zustand/commit/6c9944b2c8d10c89e04024cd14999c85648fc310#diff-ca56e63fa839455c920562a44ebc44594f47957bbd3e9873c8a9e64104af2c41R22
*/
const useMemoSelector = <TState, TSelected = NoInfer<TState>>(
  getState: () => TState,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
) =>
  useMemo(() => {
    let lastSelection: TSelected
    let lastState: TState
    return () => {
      const state = getState()

      if (!shallow(lastState, state)) {
        lastSelection = selector(state)
        lastState = state
      }

      return lastSelection
    }
  }, [getState, selector])

export function useStore<
  TState,
  TSelected = NoInfer<TState>,
  TUpdater extends AnyUpdater = AnyUpdater,
>(
  store: Store<TState, TUpdater>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
) {
  const slice = useSyncExternalStore(
    store.subscribe,
    useMemoSelector(() => store.state, selector),
    useMemoSelector(() => store.state, selector),
  )

  return slice
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
