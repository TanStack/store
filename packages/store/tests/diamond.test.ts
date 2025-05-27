import { describe, expect, test, vi } from 'vitest'
import { Store, Derived } from '../src'

describe('Diamond dependency pattern', () => {
  test('correctly computes values in diamond dependency pattern', () => {
    const source = new Store(100)
    
    // Path A: source -> half
    const half = new Derived({
      deps: [source],
      fn: ({ currDepVals: [val] }) => val / 2
    })
    
    // Path B: source -> third
    const third = new Derived({
      deps: [source],
      fn: ({ currDepVals: [val] }) => val / 3
    })
    
    // Both paths converge: half + third
    const sum = new Derived({
      deps: [half, third],
      fn: ({ currDepVals: [halfVal, thirdVal] }) => halfVal + thirdVal
    })

    const listener = vi.fn()
    sum.subscribe(listener)

    expect(sum.state).toBe(83.33333333333333) // 50 + 33.333...

    // Update source in a batch
    source.setState(() => 60)

    expect(sum.state).toBe(50) // 30 + 20
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
