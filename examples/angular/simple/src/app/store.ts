import { Store } from '@tanstack/store'

// You can use @tanstack/store outside of App components too!
export const store = new Store({
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
