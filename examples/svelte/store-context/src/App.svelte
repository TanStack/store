<script lang="ts">
  import { setContext } from 'svelte'
  import { createAtom, Store } from '@tanstack/svelte-store'
  import AtomSection from './AtomSection.svelte'
  import StoreSection from './StoreSection.svelte'
  import { STORE_CONTEXT } from './context'
  import type { CounterStore } from './context'

  // one drawback of storing stores and atoms in context is you have to define types for the context manually, instead of everything being inferred.

  // Svelte components initialize once per mount, so stores and atoms created here stay stable for this provider instance.
  const votesStore = new Store<CounterStore>({
    cats: 0,
    dogs: 0,
  })
  const countAtom = createAtom(0)

  setContext(STORE_CONTEXT, { votesStore, countAtom })
</script>

<main>
  <h1>Svelte Store Context</h1>
  <p>
    This example provides both atoms and stores through a single typed context
    object, then consumes them from nested components.
  </p>
  <StoreSection />
  <AtomSection />
</main>
