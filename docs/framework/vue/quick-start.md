---
title: Quick Start
id: quick-start
---

The basic vue app example to get started with the TanStack vue-store.

**App.vue**
```html
<script setup>
import Increment from './Increment.vue';
import Display from './Display.vue';
</script>

<template>
  <h1>How many of your friends like cats or dogs?</h1>
  <p>Press one of the buttons to add a counter of how many of your friends like cats or dogs</p>
  <Increment animal="dogs" />
  <Display animal="dogs" />
  <Increment animal="cats" />
  <Display animal="cats" />
</template>
```

**store.js**
```js
import { createStore } from '@tanstack/vue-store';

// You can instantiate the store outside of Vue components too!
export const store = createStore({
  dogs: 0,
  cats: 0,
});

export function updateState(animal) {
  store.setState((state) => {
    return {
      ...state,
      [animal]: state[animal] + 1,
    };
  });
}
```

**Display.vue**
```html
<script setup>
import { useStore } from '@tanstack/vue-store';
import { store } from './store';

const props = defineProps({ animal: String });
const count = useStore(store, (state) => state[props.animal]);
</script>

<!-- This will only re-render when `state[props.animal]` changes. If an unrelated store property changes, it won't re-render -->
<template>
  <div>{{ animal }}: {{ count }}</div>
</template>
```

**Increment.vue**
```html
<script setup>
import { store, updateState } from './store';

const props = defineProps({ animal: String });
</script>

<template>
  <button @click="updateState(animal)">My Friend Likes {{ animal }}</button>
</template>
```
