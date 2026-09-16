<script lang="ts">
  import { untrack } from 'svelte'
  import { createStore } from '@tanstack/store'
  import { useSelector } from '../src/index.svelte.js'

  // Three arms driven by one button, so a failure says *why* it failed:
  //   default    object slice compared with the library's own `===`
  //   keyed      object slice behind a compare no proxy can fool   (control)
  //   primitive  string slice, which Svelte never proxies          (control)
  // Proxying the slice breaks only the first arm, which pins the cause to the
  // proxy rather than to the store or the subscription.

  // Each selected slice keeps ONE identity for the whole run; only the
  // unrelated `ignored` field ever changes. That is precisely what a selector
  // exists to memoize, so a correct one wakes its readers exactly once.
  const DEFAULT_SELECTED = { id: 'stable', rows: ['a', 'b'] }
  const KEYED_SELECTED = { id: 'stable', rows: ['a', 'b'] }

  const defaultStore = createStore({ selected: DEFAULT_SELECTED, ignored: 0 })
  const keyedStore = createStore({ selected: KEYED_SELECTED, ignored: 0 })
  const primitiveStore = createStore({ label: 'constant', ignored: 0 })

  const defaultSlice = useSelector(defaultStore, (state) => state.selected)
  const keyedSlice = useSelector(keyedStore, (state) => state.selected, {
    compare: (a, b) => a.id === b.id,
  })
  const primitiveSlice = useSelector(primitiveStore, (state) => state.label)

  let defaultRenders = $state(0)
  let keyedRenders = $state(0)
  let primitiveRenders = $state(0)
  let defaultIdentities = $state(0)
  let sameObject = $state(false)

  // Re-setting the slice mints a fresh Proxy each time, so counting identities
  // separates "notified again" from "notified with something genuinely new".
  // Deliberately a plain Set rather than a SvelteSet: the instrument must stay
  // outside the reactivity it measures.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const seen = new Set()

  $effect(() => {
    const current = defaultSlice.current
    untrack(() => {
      defaultRenders++
      seen.add(current)
      defaultIdentities = seen.size
      // Compiled to Svelte's instrumented `===`, which warns only when the two
      // sides are the same underlying object yet `===` reports otherwise.
      sameObject = current === DEFAULT_SELECTED
    })
  })

  $effect(() => {
    keyedSlice.current
    untrack(() => {
      keyedRenders++
    })
  })

  $effect(() => {
    primitiveSlice.current
    untrack(() => {
      primitiveRenders++
    })
  })

  function updateIgnored() {
    defaultStore.setState((v) => ({ ...v, ignored: v.ignored + 1 }))
    keyedStore.setState((v) => ({ ...v, ignored: v.ignored + 1 }))
    primitiveStore.setState((v) => ({ ...v, ignored: v.ignored + 1 }))
  }
</script>

<div>
  <p>Default renders: {defaultRenders}</p>
  <p>Default identities: {defaultIdentities}</p>
  <p>Same object: {sameObject}</p>
  <p>Keyed renders: {keyedRenders}</p>
  <p>Primitive renders: {primitiveRenders}</p>
  <button onclick={updateIgnored}>Update ignored</button>
</div>
