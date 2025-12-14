import { describe, expect, test, vi } from 'vitest'
import { createAtom } from '@xstate/store'

describe('Store.setState Type Safety Improvements', () => {
  test('should handle function updater safely', () => {
    const store = createAtom(0)

    store.set((prev) => prev + 5)
    expect(store.get()).toBe(5)

    store.set((prev) => prev * 2)
    expect(store.get()).toBe(10)
  })

  test('should handle direct value updater safely', () => {
    const store = createAtom(42)

    store.set(100)
    expect(store.get()).toBe(100)
  })

  test('should work with complex state types', () => {
    interface ComplexState {
      count: number
      user: { name: string; age: number }
    }

    const store = createAtom<ComplexState>({
      count: 0,
      user: { name: 'John', age: 25 },
    })

    store.set((prev) => ({
      ...prev,
      count: prev.count + 1,
      user: { ...prev.user, age: prev.user.age + 1 },
    }))

    expect(store.get().count).toBe(1)
    expect(store.get().user.age).toBe(26)
  })

  // test('should work with custom updateFn', () => {
  //   const store = new Store<string>('initial', {
  //     updateFn: (prev) => (updater) => {
  //       if (typeof updater === 'function') {
  //         return updater(prev)
  //       }
  //       return updater
  //     },
  //   })

  //   store.setState((prev) => `${prev} updated`)
  //   expect(store.state).toBe('initial updated')

  //   store.setState('direct value')
  //   expect(store.state).toBe('direct value')
  // })

  test('should call listeners with correct event structure', () => {
    const store = createAtom<{ value: number }>({ value: 0 })
    const derivedStore = createAtom<{
      prevVal: { value: number } | undefined
      currentVal: { value: number }
    }>((_, prev) => ({
      prevVal: prev?.currentVal,
      currentVal: store.get(),
    }))
    const listener = vi.fn()

    derivedStore.subscribe(listener)

    store.set((prev) => ({ value: prev.value + 10 }))

    expect(listener).toHaveBeenCalledWith({
      prevVal: { value: 0 },
      currentVal: { value: 10 },
    })
  })

  test('should handle edge cases safely', () => {
    const nullableStore = createAtom<string | null>(null)
    nullableStore.set('not null')
    expect(nullableStore.get()).toBe('not null')

    nullableStore.set(() => null)
    expect(nullableStore.get()).toBe(null)

    const arrayStore = createAtom<Array<number>>([])
    arrayStore.set((prev) => [...prev, 1, 2, 3])
    expect(arrayStore.get()).toEqual([1, 2, 3])

    arrayStore.set([4, 5, 6])
    expect(arrayStore.get()).toEqual([4, 5, 6])
  })

  test('should not cause performance regression', () => {
    const store = createAtom<number>(0)
    const iterations = 1000

    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      store.set((prev) => prev + 1)
    }

    const end = performance.now()
    const duration = end - start

    expect(store.get()).toBe(iterations)
    expect(duration).toBeLessThan(100)
  })
})
