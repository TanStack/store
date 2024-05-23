<script lang="ts">
    import { Store } from '@tanstack/store'
    import { useStore } from "../lib/index.svelte.js"
    
    const store = new Store({
      select: 0,
      ignored: 1,
    })

    const storeVal = useStore(store, (state) => state.select)
</script>


<p>Store: {storeVal.value}</p>