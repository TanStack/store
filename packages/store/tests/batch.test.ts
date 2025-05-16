import { describe, expect, test } from 'vitest'
import { Store } from '../src/store'
import { batch } from '../src'

describe('batch', () => {
  test('updates store immediately', () => {
    const store = new Store({ hello: 100, world: 200 })
    batch(() => {
      store.setState((state) => ({ ...state, hello: state.hello + 1 }))
      expect(store.state.hello).toBe(101)
      expect(store.state.world).toBe(200)
      store.setState((state) => ({ ...state, world: state.world + 1 }))
      expect(store.state.hello).toBe(101)
      expect(store.state.world).toBe(201)
    })

    expect(store.state.hello).toBe(101)
    expect(store.state.world).toBe(201)
  })
})
