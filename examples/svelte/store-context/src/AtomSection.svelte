<script lang="ts">
  import { getContext } from 'svelte'
  import { useAtom, useSetValue, useValue } from '@tanstack/svelte-store'
  import { STORE_CONTEXT } from './context'
  import type { StoreContextValue } from './context'

  const { countAtom } = getContext<StoreContextValue>(STORE_CONTEXT)

  const count = useValue(countAtom)
  const setCount = useSetValue(countAtom)
  const [editableCount, setEditableCount] = useAtom(countAtom)
</script>

<section>
  <h2>Nested Atom Components</h2>
  <p>Atom count: {count.current}</p>
  <div>
    <button onclick={() => setCount((prev) => prev + 1)}>Increment atom</button>
    <button onclick={() => setCount(0)}>Reset atom</button>
  </div>
  <div>
    <p>Editable atom count: {editableCount.current}</p>
    <button onclick={() => setEditableCount((prev) => prev + 5)}>
      Add 5 to atom
    </button>
  </div>
</section>
