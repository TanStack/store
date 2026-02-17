---
title: Quick Start
id: quick-start
---

The basic Svelte app example to get started with the TanStack svelte-store.

**store.ts**
```ts
import { createStore } from '@tanstack/svelte-store';

// You can instantiate the store outside of Svelte files too!
export const store = createStore({
  dogs: 0,
  cats: 0,
});

export function updateState(animal: 'cats' | 'dogs') {
  store.setState((state) => {
    return {
      ...state,
      [animal]: state[animal] + 1,
    };
  });
}
```

**App.svelte**
```html
<script lang="ts">
	import Increment from "./Increment.svelte";
	import Display from "./Display.svelte";
</script>


<h1>How many of your friends like cats or dogs?</h1>
<p>Press one of the buttons to add a counter of how many of your friends like cats or dogs</p>
<Increment animal="dogs" />
<Display animal="dogs" />
<Increment animal="cats" />
<Display animal="cats" />
```


**Display.svelte**
```html
<script lang="ts">
    import { useStore } from '@tanstack/svelte-store';
    import { store } from './store';
    
    const {animal}: { animal: 'cats' | 'dogs' } = $props()
    const count = useStore(store, (state) => state[animal]);
</script>
    
<!-- This will only re-render when `state[animal]` changes. If an unrelated store property changes, it won't re-render -->
<div>{ animal }: { count.current }</div>
```

**Increment.svelte**
```html
<script lang="ts">
    import { updateState } from './store';
    
    const { animal }: { animal: 'cats' | 'dogs' } = $props()
</script>
    
<button onclick={() => updateState(animal)}>My Friend Likes { animal }</button>
```
