import { Store } from '@tanstack/angular-store'

// You can instantiate a Store outside of Angular components too!
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
