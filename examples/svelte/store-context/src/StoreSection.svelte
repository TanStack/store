<script lang="ts">
  import { getContext } from 'svelte'
  import { useSelector } from '@tanstack/svelte-store'
  import { STORE_CONTEXT } from './context'
  import type { StoreContextValue } from './context'

  const { votesStore } = getContext<StoreContextValue>(STORE_CONTEXT)

  // select a value from the store with useSelector
  const cats = useSelector(votesStore, (state) => state.cats)
  const dogs = useSelector(votesStore, (state) => state.dogs)
  // custom selector to calculate total votes from the store state
  const total = useSelector(votesStore, (state) => state.cats + state.dogs)
</script>

<p>Cats: {cats.current}</p>
<p>Dogs: {dogs.current}</p>
<p>Total votes: {total.current}</p>
<div>
  <button
    onclick={() =>
      votesStore.setState((prev) => ({
        ...prev,
        cats: prev.cats + 1,
      }))}
  >
    Add cat
  </button>
  <button
    onclick={() =>
      votesStore.setState((prev) => ({
        ...prev,
        dogs: prev.dogs + 1,
      }))}
  >
    Add dog
  </button>
</div>
