import { describe, expect, test, vi } from 'vitest'
import {
  Derived,
  Store,
  batch,
  __derivedToStore,
  __storeToDerived,
} from '../src'

describe('Scheduler logic', () => {
  test('Should build a graph properly', () => {
    const count = new Store<any, any>(10)

    const halfCount = new Derived<any, any>({
      deps: [count],
      fn: () => {
        return count.state / 2
      },
    })

    halfCount.registerOnGraph()

    const doubleHalfCount = new Derived<any, any>({
      deps: [halfCount],
      fn: () => {
        return halfCount.state * 2
      },
    })

    doubleHalfCount.registerOnGraph()

    expect(__storeToDerived.get(count)).toContain(halfCount)
    expect(__derivedToStore.get(halfCount)).toContain(count)
    expect(__storeToDerived.get(count)).toContain(doubleHalfCount)
    expect(__derivedToStore.get(doubleHalfCount)).toContain(count)
  })

  test('should unbuild a graph properly', () => {
    const count = new Store<any, any>(10)

    const halfCount = new Derived<any, any>({
      deps: [count],
      fn: () => {
        return count.state / 2
      },
    })

    halfCount.registerOnGraph()

    const doubleHalfCount = new Derived<any, any>({
      deps: [halfCount],
      fn: () => {
        return halfCount.state * 2
      },
    })

    doubleHalfCount.registerOnGraph()

    doubleHalfCount.unregisterFromGraph()

    expect(__storeToDerived.get(count)).toContain(halfCount)
    expect(__derivedToStore.get(halfCount)).toContain(count)
    expect(__storeToDerived.get(count)).not.toContain(doubleHalfCount)
    expect(__derivedToStore.get(doubleHalfCount)).not.toContain(count)

    halfCount.unregisterFromGraph()

    expect(__storeToDerived.get(count)).not.toContain(halfCount)
    expect(__derivedToStore.get(halfCount)).not.toContain(count)
  })

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