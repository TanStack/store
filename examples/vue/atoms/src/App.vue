<script setup lang="ts">
import { createAtom, useAtom, useValue } from '@tanstack/vue-store'

// Optionally, you can create atoms outside of Vue components at module scope
const countAtom = createAtom(0)

const count = useValue(countAtom) // useValue re-renders when the value changes. Useful for read-only access to an atom.
const [editableCount, setEditableCount] = useAtom(countAtom) // read and write access to the atom. Re-renders when the value changes.
</script>

<template>
  <main>
    <h1>Vue Atom Hooks</h1>
    <p>
      This example creates a module-level atom and reads and updates it with the
      Vue hooks.
    </p>
    <p>Total: {{ count }}</p>
    <div>
      <button type="button" @click="countAtom.set((prev: number) => prev + 1)">
        Increment
      </button>
      <button type="button" @click="countAtom.set(0)">Reset</button>
    </div>
    <div>
      <p>Editable count: {{ editableCount }}</p>
      <button
        type="button"
        @click="setEditableCount((prev: number) => prev + 5)"
      >
        Add 5 with useAtom
      </button>
    </div>
  </main>
</template>
