<script setup lang="ts">
import { Store, useSelector } from '@tanstack/vue-store'

// Optionally, you can create stores outside of Vue components at module scope
const petStore = new Store({
  cats: 0,
  dogs: 0,
})

// read state slice (only re-renders when the selected value changes)
const cats = useSelector(petStore, (state) => state.cats)
const dogs = useSelector(petStore, (state) => state.dogs)
const total = useSelector(petStore, (state) => state.cats + state.dogs)

function addCat() {
  petStore.setState((prev) => ({
    ...prev,
    cats: prev.cats + 1,
  }))
}

function addDog() {
  // directly update values in the store
  petStore.setState((prev) => ({
    ...prev,
    dogs: prev.dogs + 1,
  }))
}
</script>

<template>
  <main>
    <h1>Vue Store Hooks</h1>
    <p>
      This example creates a module-level store. Components read state with
      `useSelector` and update it directly with `store.setState`.
    </p>
    <p>Cats: {{ cats }}</p>
    <p>Dogs: {{ dogs }}</p>
    <p>Total votes: {{ total }}</p>
    <div>
      <button type="button" @click="addCat">Add cat</button>
      <button type="button" @click="addDog">Add dog</button>
    </div>
  </main>
</template>
