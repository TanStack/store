import { createStore } from '@tanstack/marko-store'

// You can instantiate a Store outside of components, at module scope.
export const store = createStore({
  dogs: 0,
  cats: 0,
})
