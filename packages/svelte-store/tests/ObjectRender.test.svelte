<script lang="ts">
  import { untrack } from 'svelte'
  import { createStore } from '@tanstack/store'
  import { useSelector } from '../src/index.svelte.js'

  const nestedObj = { count: 0 }
  const store = createStore({
    nested: nestedObj,
    ignored: 1,
  })

  const storeVal = useSelector(store, (state) => state.nested)

  let renderCount = $state(0)

  $effect(() => {
    storeVal.current
    untrack(() => {
      renderCount++
    })
  })
</script>

<div>
  <p>Number rendered: {renderCount}</p>
  <p>Store: {storeVal.current.count}</p>
  <p>Is raw reference: {String(storeVal.current === nestedObj)}</p>
  <button
    onclick={() =>
      store.setState((v) => ({
        ...v,
        nested: { count: v.nested.count + 10 },
      }))}
  >
    Update nested
  </button>
  <button
    onclick={() =>
      store.setState((v) => ({
        ...v,
        ignored: v.ignored + 10,
      }))}
  >
    Update ignored
  </button>
</div>
