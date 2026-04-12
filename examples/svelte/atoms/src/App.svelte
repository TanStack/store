<script lang="ts">
  import {
    createAtom,
    useAtom,
    useSetValue,
    useValue,
  } from '@tanstack/svelte-store'

  // Optionally, you can create atoms outside of Svelte files at module scope
  const countAtom = createAtom(0)

  const count = useValue(countAtom) // useValue re-renders when the value changes. Useful for read-only access to an atom.
  const setCount = useSetValue(countAtom) // useSetValue avoids wiring the current value into this component when you only need writes.
  const [editableCount, setEditableCount] = useAtom(countAtom) // read and write access to the atom.
</script>

<main>
  <h1>Svelte Atom Hooks</h1>
  <p>
    This example creates a module-level atom and reads and updates it with the
    Svelte hooks.
  </p>
  <p>Total: {count.current}</p>
  <div>
    <button onclick={() => setCount((prev) => prev + 1)}>
      Increment with useSetValue
    </button>
    <button onclick={() => setCount(0)}>Reset with useSetValue</button>
  </div>
  <div>
    <p>Editable count: {editableCount.current}</p>
    <button onclick={() => setEditableCount((prev) => prev + 5)}>
      Add 5 with useAtom
    </button>
  </div>
</main>
