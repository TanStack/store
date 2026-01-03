import { createAtom } from '@tanstack/vue-store'

// You can instantiate a Store outside of Vue components too!
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
