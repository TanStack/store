import type { Atom, ReadonlyAtom, ReadonlyStore, Store } from '@tanstack/store'
import type { ComponentBody } from 'octane'

export const SelectorPair: ComponentBody<{
  left: Atom<number>
  right: Atom<number>
}>

export const ComparedSelection: ComponentBody<{
  store: Store<{ visible: number; ignored: number }>
}>

export const DerivedPair: ComponentBody<{
  atom: ReadonlyAtom<number>
  store: ReadonlyStore<number>
}>

export const SwitchingSource: ComponentBody<{
  first: Atom<number>
  second: Atom<number>
}>

export const CreatedAtoms: ComponentBody
export const CreatedStores: ComponentBody

export const AtomTuple: ComponentBody<{
  atom: Atom<number>
}>

export const NestedProviders: ComponentBody<{
  outer: Atom<number>
  inner: Atom<number>
}>

export const MissingProvider: ComponentBody

export const SubscriptionReader: ComponentBody<{
  source: {
    get: () => number
    subscribe: (listener: (value: number) => void) => {
      unsubscribe: () => void
    }
  }
}>
