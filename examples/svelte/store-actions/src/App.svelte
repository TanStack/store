<script lang="ts">
  import { createStore, _useStore, useSelector } from '@tanstack/svelte-store'

  // Optionally, you can create stores outside of Svelte files at module scope
  const petStore = createStore(
    {
      cats: 0,
      dogs: 0,
    },
    ({ setState, get }) =>
      // optionally, define actions for updating your store in specific ways right on the store.
      ({
        addCat: () =>
          setState((prev) => ({
            ...prev,
            cats: prev.cats + 1,
          })),
        addDog: () =>
          setState((prev) => ({
            ...prev,
            dogs: prev.dogs + 1,
          })),
        log: () => console.log(get()),
      }),
  )

  // Read via useSelector and grab actions directly from the store
  const cats = useSelector(petStore, (state) => state.cats)
  const { addCat } = petStore.actions

  // _useStore gives both the selected state and actions in a single tuple
  const [dogs, { addDog }] = _useStore(petStore, (state) => state.dogs)

  const total = useSelector(petStore, (state) => state.cats + state.dogs)
</script>

<main>
  <button onclick={petStore.actions.log}>Log State</button>
  <h1>Svelte Store Actions</h1>
  <p>
    This example creates a module-level store with actions. Components read
    state with <code>useSelector</code> and call mutations through
    <code>store.actions</code> or the experimental <code>_useStore</code>
    hook.
  </p>
  <div>
    <p>Cats: {cats.current}</p>
    <button onclick={() => addCat()}>Vote for cats</button>
  </div>
  <div>
    <p>Dogs: {dogs.current}</p>
    <button onclick={() => addDog()}>Vote for dogs</button>
  </div>
  <p>Total votes: {total.current}</p>
</main>
