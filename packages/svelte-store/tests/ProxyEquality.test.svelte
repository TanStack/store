<script lang="ts">
  import { untrack } from 'svelte'
  import { createStore } from '@tanstack/store'
  import { useSelector } from '../src/index.svelte.js'

  const store = createStore({
    selected: { value: 1 },
    ignored: 0,
  })

  const selected = useSelector(store, (state) => state.selected)

  let renderCount = $state(0)

  $effect(() => {
    selected.current
    untrack(() => {
      renderCount++
    })
  })
</script>

<div>
  <p>Number rendered: {renderCount}</p>
  <p>Value: {selected.current.value}</p>
  <button
    onclick={() =>
      store.setState((v) => ({
        ...v,
        ignored: v.ignored + 1,
      }))}
  >
    Update ignored
  </button>
</div>
