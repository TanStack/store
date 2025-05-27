import { describe, expect, test, vi } from 'vitest'
import {
  Store,
  batch,
} from '../src'

describe('Scheduler logic', () => {
  test('Batch prevents listeners from being called during repeated setStates', () => {
    const store = new Store(0)

    const listener = vi.fn()

    const unsub = store.subscribe(listener)

    batch(() => {
      store.setState(() => 1)
      store.setState(() => 2)
      store.setState(() => 3)
      store.setState(() => 4)
    })

    expect(store.state).toEqual(4)
    // Listener is only called once because of batching
    expect(listener).toHaveBeenCalledTimes(1)

    store.setState(() => 1)
    store.setState(() => 2)
    store.setState(() => 3)
    store.setState(() => 4)

    expect(store.state).toEqual(4)
    // Listener is called 4 times because of a lack of batching
    expect(listener).toHaveBeenCalledTimes(5)
    unsub()
  })
})
