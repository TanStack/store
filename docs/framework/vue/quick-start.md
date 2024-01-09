---
title: Quick Start
id: quick-start
---

To get started with vue-store, I will be using the default vue setup but this time store the count with vue-store instead of 'ref'

First create a `store.ts` file in your src folder and write this
```ts
import { Store } from "@tanstack/vue-store"

export const store = new Store({
    count: 0
})
```
the store constructor takes an object with the values with want in our global state in this case our count.

Now in the script tag of the default HelloWorld.vue, you write:
```ts
import { useStore } from "@tanstack/vue-store"
import { store } from '../store';

const countValue = useStore(store, (state) => state.count)
```
useStore hook lets us extract state from our store object. in this case we want to extract the `count` value

now we can put the countValue in our template

```html
<div class="card">
    <button type="button" @click="increment">
        count is {{ countValue }}
    </button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
</div>
```

now to update the state:

```ts
 const increment = () => {
    store.setState((state) => {
        return {
            count: state.count + 1
        }
    })
}
```
