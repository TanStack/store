<script lang="ts">
  import { Store, useSelector, useStoreActions } from '@tanstack/svelte-store'

  // Optionally, you can create stores outside of Svelte files at module scope
  const petStore = new Store(
    {
      cats: 0,
      dogs: 0,
    },
    ({ set }) =>
      // optionally, define actions for updating your store in specific ways right on the store.
      ({
        addCat: () =>
          set((prev) => ({
            ...prev,
            cats: prev.cats + 1,
          })),
        addDog: () =>
          set((prev) => ({
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

<main>
  <h1>Svelte Store Actions</h1>
  <p>
    This example creates a module-level store with actions. Components read
    state with `useSelector` and call mutations through `useStoreActions`.
  </p>
  <p>Cats: {cats.current}</p>
  <p>Dogs: {dogs.current}</p>
  <p>Total votes: {total.current}</p>
  <div>
    <button onclick={() => addCat()}>Add cat</button>
    <button onclick={() => addDog()}>Add dog</button>
  </div>
</main>
