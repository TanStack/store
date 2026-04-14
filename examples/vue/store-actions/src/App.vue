<script setup lang="ts">
import { createStore, _useStore, useSelector } from '@tanstack/vue-store'

// Optionally, you can create stores outside of Vue components at module scope
const petStore = createStore(
  {
    cats: 0,
    dogs: 0,
  },
  ({ setState, get }) =>
    // optionally, define actions for updating your store in specific ways right on the store.
    ({
      addCat: () =>
        setState((prev: { cats: number; dogs: number }) => ({
          ...prev,
          cats: prev.cats + 1,
        })),
      addDog: () =>
        setState((prev: { cats: number; dogs: number }) => ({
          ...prev,
          dogs: prev.dogs + 1,
        })),
      log: () => console.log(get()),
    }),
)

// _useStore gives both the selected state and actions in a single tuple
const [cats, { addCat }] = _useStore(petStore, (state) => state.cats)
const [dogs, { addDog }] = _useStore(petStore, (state) => state.dogs)
const total = useSelector(petStore, (state) => state.cats + state.dogs)
</script>

<template>
  <main>
    <button type="button" @click="petStore.actions.log()">Log State</button>
    <h1>Vue Store Actions</h1>
    <p>
      This example creates a module-level store with actions. Components read
      state with <code>useSelector</code> and call mutations through
      <code>store.actions</code> or the experimental <code>_useStore</code>
      hook.
    </p>
    <div>
      <p>Cats: {{ cats }}</p>
      <button type="button" @click="addCat()">Vote for cats</button>
    </div>
    <div>
      <p>Dogs: {{ dogs }}</p>
      <button type="button" @click="addDog()">Vote for dogs</button>
    </div>
    <p>Total votes: {{ total }}</p>
  </main>
</template>
