import { describe, expect, test, vi } from 'vitest'
import { batch, createStore } from '../src'

describe('batch', () => {
  test('updates store immediately', () => {
    const store = createStore({ hello: 100, world: 200 })
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

  test('notifies subscribers once after entire batch completes', () => {
    const store = createStore(0)
    const listener = vi.fn()
    store.subscribe(listener)

    batch(() => {
      store.setState((prev) => prev + 1)
      store.setState((prev) => prev + 1)
      store.setState((prev) => prev + 1)
      expect(listener).not.toHaveBeenCalled()
    })

    expect(store.state).toBe(3)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(3)
  })

  test('batch returns the value produced by callback', () => {
    const result = batch(() => 'batched-result')
    expect(result).toBe('batched-result')
  })
})
