import { createAtom } from '@tanstack/angular-store'

// You can instantiate a Store outside of Angular components too!
export const store = createAtom({
  dogs: 0,
  cats: 0,
})

export function updateState(animal: 'dogs' | 'cats') {
  store.set((state) => {
    return {
      ...state,
      [animal]: state[animal] + 1,
    }
  })
}
