import { createStore } from '@tanstack/marko-store'

// A module-level store created WITH actions (the second argument).
export const petStore = createStore(
  { cats: 0, dogs: 0 },
  ({ setState, get }) => ({
    addCat: () => setState((prev) => ({ ...prev, cats: prev.cats + 1 })),
    addDog: () => setState((prev) => ({ ...prev, dogs: prev.dogs + 1 })),
    log: () => console.log(get()),
  }),
)
