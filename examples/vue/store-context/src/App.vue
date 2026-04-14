<script setup lang="ts">
import { defineComponent, h, inject, provide } from 'vue'
import {
  createAtom,
  createStore,
  useAtom,
  useSelector,
  useValue,
} from '@tanstack/vue-store'
import type { Atom, Store } from '@tanstack/vue-store'
import type { InjectionKey } from 'vue'

// one drawback of storing stores and atoms in context is you have to define types for the context manually, instead of everything being inferred.

type CounterStore = {
  cats: number
  dogs: number
}

type StoreContextValue = {
  votesStore: Store<CounterStore>
  countAtom: Atom<number>
}

const StoreContextKey = Symbol(
  'StoreContext',
) as InjectionKey<StoreContextValue>

function useStoreContext() {
  const value = inject(StoreContextKey)

  if (!value) {
    throw new Error('Missing StoreProvider for StoreContext')
  }

  return value
}

// Vue setup runs once per component instance, so stores and atoms created here stay stable for this provider instance.
const votesStore = createStore<CounterStore>({
  cats: 0,
  dogs: 0,
})
const countAtom = createAtom(0)

provide(StoreContextKey, { votesStore, countAtom })

const CatCard = defineComponent(() => {
  const { votesStore } = useStoreContext()
  // select a value from the store with useSelector
  const value = useSelector(votesStore, (state) => state.cats)

  return () => h('p', `Cats: ${value.value}`)
})

const DogCard = defineComponent(() => {
  const { votesStore } = useStoreContext()
  // select a value from the store with useSelector
  const value = useSelector(votesStore, (state) => state.dogs)

  return () => h('p', `Dogs: ${value.value}`)
})

const TotalCard = defineComponent(() => {
  const { votesStore } = useStoreContext()
  // custom selector to calculate total votes from the store state
  const total = useSelector(votesStore, (state) => state.cats + state.dogs)

  return () => h('p', `Total votes: ${total.value}`)
})

const AtomSummary = defineComponent(() => {
  const { countAtom } = useStoreContext()
  const count = useValue(countAtom)

  return () => h('p', `Atom count: ${count.value}`)
})

const NestedAtomControls = defineComponent(() => {
  const { countAtom } = useStoreContext()

  return () =>
    h('div', [
      h(
        'button',
        {
          type: 'button',
          onClick: () => countAtom.set((prev: number) => prev + 1),
        },
        'Increment atom',
      ),
      h(
        'button',
        { type: 'button', onClick: () => countAtom.set(0) },
        'Reset atom',
      ),
    ])
})

const DeepAtomEditor = defineComponent(() => {
  const { countAtom } = useStoreContext()
  const [count, setCount] = useAtom(countAtom)

  return () =>
    h('div', [
      h('p', `Editable atom count: ${count.value}`),
      h(
        'button',
        { type: 'button', onClick: () => setCount((prev: number) => prev + 5) },
        'Add 5 to atom',
      ),
    ])
})

const StoreButtons = defineComponent(() => {
  const { votesStore } = useStoreContext()

  return () =>
    h('div', [
      h(
        'button',
        {
          type: 'button',
          onClick: () =>
            votesStore.setState((prev: CounterStore) => ({
              ...prev,
              cats: prev.cats + 1,
            })),
        },
        'Add cat',
      ),
      h(
        'button',
        {
          type: 'button',
          onClick: () =>
            votesStore.setState((prev: CounterStore) => ({
              ...prev,
              dogs: prev.dogs + 1,
            })),
        },
        'Add dog',
      ),
    ])
})
</script>

<template>
  <main>
    <h1>Vue Store Context</h1>
    <p>
      This example provides both atoms and stores through a single typed context
      object, then consumes them from nested components.
    </p>
    <CatCard />
    <DogCard />
    <TotalCard />
    <StoreButtons />
    <section>
      <h2>Nested Atom Components</h2>
      <AtomSummary />
      <NestedAtomControls />
      <DeepAtomEditor />
    </section>
  </main>
</template>
