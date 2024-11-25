<script setup>
import { useStore } from '@tanstack/vue-store'
import { store } from './store'

const props = defineProps({ animal: String })
const count = useStore(store, (state) => state[props.animal])
</script>

<!-- This will only re-render when `state[props.animal]` changes. If an unrelated store property changes, it won't re-render -->
<template>
  <div>{{ animal }}: {{ count }}</div>
</template>
