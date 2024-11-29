import { describe, expect, test } from 'vitest'
import { Derived, Store, __derivedToStore, __storeToDerived } from '../src'

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
})
