<script lang="ts">
  import { updateState } from './store'

  const { animal }: { animal: 'cats' | 'dogs' } = $props()
</script>

<button onclick={() => updateState(animal)}>My Friend Likes {animal}</button>
