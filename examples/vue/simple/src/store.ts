import { createStore } from '@tanstack/vue-store'

// You can instantiate a Store outside of Vue components too!
export const store = createStore({
  dogs: 0,
  cats: 0,
})

export function updateState(animal: 'dogs' | 'cats') {
  store.setState((state) => {
    return {
      ...state,
      [animal]: state[animal] + 1,
    }
  })
}
