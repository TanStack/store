<script lang="ts">
  import { createStore } from '@tanstack/store'
  import { useSelector } from '../src/index.svelte.js'

  const store = createStore({
    width: 10,
    height: 20,
  })

  let useWidth = $state(true)
  const storeVal = useSelector(store, (state) =>
    useWidth ? state.width : state.height,
  )
</script>

<div>
  <p>Use width: {useWidth}</p>
  <p>Value: {storeVal.current}</p>
  <button
    onclick={() =>
      store.setState((prev) => ({
        ...prev,
        width: prev.width + 1,
      }))}
  >
    Update store
  </button>
  <button onclick={() => (useWidth = !useWidth)}>Toggle</button>
</div>
