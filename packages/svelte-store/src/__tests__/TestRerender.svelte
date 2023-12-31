<script lang="ts">
      // @ts-expect-error - the tests run in jestDOM, not a browser so svelte thinks it's in SSR mode and lifecycle hooks are not available
      // https://github.com/testing-library/svelte-testing-library/issues/222
      // importing from svelte/internal is not recommended, but it's the only way to get access to afterUpdate in this case
      import { afterUpdate } from 'svelte/internal';
      import { Store } from '@tanstack/store'
      import { useStore } from ".."

      const store = new Store({
        select: 0,
        ignored: 1,
      })

      const storeVal = useStore(store, (state) => state.select)


      let renderCount = 0;


      afterUpdate(() => {
        console.log('afterUpdate');
        renderCount++;
      });
</script>


<div>
  <p>Number rendered: {renderCount}</p>
  <p>Store: {$storeVal}</p>
  <button
    on:click={() =>
      store.setState((v) => ({
        ...v,
        select: v.select + 10,
      }))
    }
  >
    Update select
  </button>
  <button
    on:click={() =>
      store.setState((v) => ({
        ...v,
        ignored: v.ignored + 10,
      }))
    }
  >
    Update ignored
  </button>
</div>