import { createStore } from '@tanstack/marko-store'

// You can create stores at module scope and import them wherever you need them.
export const petStore = createStore({
  cats: 0,
  dogs: 0,
})
