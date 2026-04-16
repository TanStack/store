<script lang="ts">
  import { createStore } from '@tanstack/store'
  import { useSelector } from '../src/index.svelte.js'

  const baseStore = createStore(1)
  const readonlyStore = createStore(() => ({ value: baseStore.state * 2 }))

  const value = useSelector(baseStore)
  const readonlyValue = useSelector(readonlyStore)
</script>

<div>
  <p>Value: {value.current}</p>
  <p>Readonly: {readonlyValue.current.value}</p>
  <button onclick={() => baseStore.setState((prev) => prev + 1)}>Update</button>
</div>
