<script lang="ts">
  import { untrack } from 'svelte'
  import { createAtom } from '@xstate/store'
  import { useStore } from '../src/index.svelte.js'

  const store = createAtom({
    select: 0,
    ignored: 1,
  })

  const storeVal = useStore(store, (state) => state.select)

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
  <p>Store: {storeVal.current}</p>
  <button
    onclick={() =>
      store.set((v) => ({
        ...v,
        select: v.select + 10,
      }))}
  >
    Update select
  </button>
  <button
    onclick={() =>
      store.set((v) => ({
        ...v,
        ignored: v.ignored + 10,
      }))}
  >
    Update ignored
  </button>
</div>
