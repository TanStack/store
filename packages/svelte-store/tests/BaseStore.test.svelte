<script lang="ts">
  import { createStore } from '@tanstack/store'
  import { useStore } from '../src/index.svelte.js'

  const store = createStore({
    select: 0,
    ignored: 1,
  })

  const storeVal = useStore(store, (state) => state.select)
</script>

<p>Store: {storeVal.current}</p>
