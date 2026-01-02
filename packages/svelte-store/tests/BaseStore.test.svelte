<script lang="ts">
  import { createAtom } from '@tanstack/store'
  import { useStore } from '../src/index.svelte.js'

  const store = createAtom({
    select: 0,
    ignored: 1,
  })

  const storeVal = useStore(store, (state) => state.select)
</script>

<p>Store: {storeVal.current}</p>
