import { describe, expect, test, vi } from 'vitest'
import { Store } from '../src/index'

describe('Store.setState Type Safety Improvements', () => {
  test('should handle function updater safely', () => {
    const store = new Store<number>(0)
    
    store.setState((prev) => prev + 5)
    expect(store.state).toBe(5)
    
    store.setState((prev) => prev * 2)
    expect(store.state).toBe(10)
  })

  test('should handle direct value updater safely', () => {
    const store = new Store<number>(42)
    
    store.setState(100)
    expect(store.state).toBe(100)
  })

  test('should work with complex state types', () => {
    interface ComplexState {
      count: number
      user: { name: string; age: number }
    }

    const store = new Store<ComplexState>({
      count: 0,
      user: { name: 'John', age: 25 }
    })

    store.setState(prev => ({
      ...prev,
      count: prev.count + 1,
      user: { ...prev.user, age: prev.user.age + 1 }
    }))

    expect(store.state.count).toBe(1)
    expect(store.state.user.age).toBe(26)
  })

  test('should work with custom updateFn', () => {
    const store = new Store<string>('initial', {
      updateFn: (prev) => (updater) => {
        if (typeof updater === 'function') {
          return updater(prev)
        }
        return updater
      }
    })

    store.setState(prev => `${prev} updated`)
    expect(store.state).toBe('initial updated')

    store.setState('direct value')
    expect(store.state).toBe('direct value')
  })

  test('should call listeners with correct event structure', () => {
    const store = new Store<{ value: number }>({ value: 0 })
    const listener = vi.fn()

    store.subscribe(listener)

    store.setState(prev => ({ value: prev.value + 10 }))

    expect(listener).toHaveBeenCalledWith({
      prevVal: { value: 0 },
      currentVal: { value: 10 }
    })
  })

  test('should handle edge cases safely', () => {
    const nullableStore = new Store<string | null>(null)
    nullableStore.setState('not null')
    expect(nullableStore.state).toBe('not null')

    nullableStore.setState(() => null)
    expect(nullableStore.state).toBe(null)

    const arrayStore = new Store<Array<number>>([])
    arrayStore.setState(prev => [...prev, 1, 2, 3])
    expect(arrayStore.state).toEqual([1, 2, 3])

    arrayStore.setState([4, 5, 6])
    expect(arrayStore.state).toEqual([4, 5, 6])
  })

  test('should not cause performance regression', () => {
    const store = new Store<number>(0)
    const iterations = 1000

    const start = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      store.setState(prev => prev + 1)
    }
    
    const end = performance.now()
    const duration = end - start

    expect(store.state).toBe(iterations)
    expect(duration).toBeLessThan(100)
  })
})