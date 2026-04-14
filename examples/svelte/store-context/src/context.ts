import type { Atom, Store } from '@tanstack/svelte-store'

export type CounterStore = {
  cats: number
  dogs: number
}

export type StoreContextValue = {
  votesStore: Store<CounterStore>
  countAtom: Atom<number>
}

export const STORE_CONTEXT = Symbol('store-context')
