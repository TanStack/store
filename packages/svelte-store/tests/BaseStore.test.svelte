<script lang="ts">
  import { createAtom } from '@xstate/store'
  import { useStore } from '../src/index.svelte.js'

  const store = createAtom({
    select: 0,
    ignored: 1,
  })

  const storeVal = useStore(store, (state) => state.select)
</script>

<p>Store: {storeVal.current}</p>
