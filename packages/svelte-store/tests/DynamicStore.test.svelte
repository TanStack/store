<script lang="ts">
  import { Store } from '@tanstack/store'
  import { useStore } from '../src/index.svelte.js'

  function createStore(count: number) {
    return new Store({ count })
  }

  let store = $state(createStore(0))

  const storeVal = useStore(
    () => store,
    (state) => state.count,
  )
</script>

<p>Store: {storeVal.current}</p>
<button onclick={() => (store = createStore(10))}>Update store</button>
