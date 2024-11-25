<script lang="ts">
  import { useStore } from '@tanstack/svelte-store';
  import { store } from './store';

  const {animal}: { animal: 'cats' | 'dogs' } = $props()
  const count = useStore(store, (state) => state[animal]);
</script>

<!-- This will only re-render when `state[animal]` changes. If an unrelated store property changes, it won't re-render -->
<div>{ animal }: { count.current }</div>
