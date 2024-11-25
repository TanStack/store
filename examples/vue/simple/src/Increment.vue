<script setup>
import { store, updateState } from './store'

const props = defineProps({ animal: String })
</script>

<template>
  <button @click="updateState(animal)">My Friend Likes {{ animal }}</button>
</template>
