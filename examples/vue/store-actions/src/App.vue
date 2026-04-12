<script setup lang="ts">
import { Store, useSelector, useStoreActions } from '@tanstack/vue-store'

// Optionally, you can create stores outside of Vue components at module scope
const petStore = new Store(
  {
    cats: 0,
    dogs: 0,
  },
  ({ set }) =>
    // optionally, define actions for updating your store in specific ways right on the store.
    ({
      addCat: () =>
        set((prev: { cats: number; dogs: number }) => ({
          ...prev,
          cats: prev.cats + 1,
        })),
      addDog: () =>
        set((prev: { cats: number; dogs: number }) => ({
          ...prev,
          dogs: prev.dogs + 1,
        })),
    }),
)

// read state slice (only re-renders when the selected value changes)
const cats = useSelector(petStore, (state) => state.cats)
const dogs = useSelector(petStore, (state) => state.dogs)
const total = useSelector(petStore, (state) => state.cats + state.dogs)
// pull stable action functions from the store
const { addCat, addDog } = useStoreActions(petStore)
</script>

<template>
  <main>
    <h1>Vue Store Actions</h1>
    <p>
      This example creates a module-level store with actions. Components read
      state with `useSelector` and call mutations through `useStoreActions`.
    </p>
    <p>Cats: {{ cats }}</p>
    <p>Dogs: {{ dogs }}</p>
    <p>Total votes: {{ total }}</p>
    <div>
      <button type="button" @click="addCat()">Add cat</button>
      <button type="button" @click="addDog()">Add dog</button>
    </div>
  </main>
</template>
