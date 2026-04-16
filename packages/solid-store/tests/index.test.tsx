import { describe, expect, it, test, vi } from 'vitest'
import { renderHook } from '@solidjs/testing-library'
import { createAtom, createStore } from '@tanstack/store'
import {
  _useStore,
  shallow,
  useAtom,
  useSelector,
  useStore,
} from '../src/index'

describe('atom hooks', () => {
  it('useSelector reads mutable atom state and updates when changed', () => {
    const atom = createAtom(0)
    const { result } = renderHook(() => useSelector(atom))

    expect(result()).toBe(0)

    atom.set((prev) => prev + 1)

    expect(result()).toBe(1)
  })

  it('useAtom returns the current accessor and setter', () => {
    const atom = createAtom(0)
    const { result } = renderHook(() => useAtom(atom))

    expect(result[0]()).toBe(0)

    result[1]((prev) => prev + 5)

    expect(result[0]()).toBe(5)
  })
})

describe('store hooks', () => {
  it('useSelector allows us to select state using a selector', () => {
    const store = createStore({
      select: 0,
      ignored: 1,
    })

    const { result } = renderHook(() =>
      useSelector(store, (state) => state.select),
    )

    expect(result()).toBe(0)
  })

  it('useSelector reads writable and readonly store state', () => {
    const baseStore = createStore(1)
    const readonlyStore = createStore(() => ({ value: baseStore.state * 2 }))
    const { result: writableValue } = renderHook(() => useSelector(baseStore))
    const { result: readonlyValue } = renderHook(() =>
      useSelector(readonlyStore),
    )

    expect(writableValue()).toBe(1)
    expect(readonlyValue().value).toBe(2)

    baseStore.setState((prev) => prev + 1)

    expect(writableValue()).toBe(2)
    expect(readonlyValue().value).toBe(4)
  })

  it('useSelector only updates the accessor when selected state changes', () => {
    const store = createStore({
      select: 0,
      ignored: 1,
    })
    const renderSpy = vi.fn()

    const { result } = renderHook(() => {
      const value = useSelector(store, (state) => state.select)
      renderSpy()
      return value
    })

    expect(result()).toBe(0)
    expect(renderSpy).toHaveBeenCalledTimes(1)

    store.setState((prev) => ({
      ...prev,
      ignored: prev.ignored + 1,
    }))
    expect(renderSpy).toHaveBeenCalledTimes(1)

    store.setState((prev) => ({
      ...prev,
      select: prev.select + 1,
    }))
    expect(result()).toBe(1)
    expect(renderSpy).toHaveBeenCalledTimes(1)
  })

  it('useSelector respects custom compare', () => {
    const store = createStore({
      array: [
        { select: 0, ignore: 1 },
        { select: 0, ignore: 1 },
      ],
    })
    const renderSpy = vi.fn()

    const { result } = renderHook(() => {
      const value = useSelector(
        store,
        (state) => state.array.map(({ ignore, ...rest }) => rest),
        {
          compare: (prev, next) =>
            JSON.stringify(prev) === JSON.stringify(next),
        },
      )
      renderSpy()
      return value
    })

    expect(result().map((item) => item.select)).toEqual([0, 0])
    expect(renderSpy).toHaveBeenCalledTimes(1)

    store.setState((prev) => ({
      array: prev.array.map((item) => ({
        ...item,
        ignore: item.ignore + 1,
      })),
    }))
    expect(renderSpy).toHaveBeenCalledTimes(1)

    store.setState((prev) => ({
      array: prev.array.map((item) => ({
        ...item,
        select: item.select + 1,
      })),
    }))
    expect(result().map((item) => item.select)).toEqual([1, 1])
    expect(renderSpy).toHaveBeenCalledTimes(1)
  })

  it('useSelector works with mounted derived stores', () => {
    const store = createStore(0)
    const derived = createStore(() => ({ val: store.state * 2 }))
    const { result } = renderHook(() =>
      useSelector(derived, (state) => state.val),
    )

    expect(result()).toBe(0)

    store.setState((prev) => prev + 1)

    expect(result()).toBe(2)
  })
})

describe('useStore', () => {
  it('is a compatibility alias for useSelector', () => {
    const store = createStore(0)
    const { result } = renderHook(() => useStore(store, (state) => state))

    expect(result()).toBe(0)

    store.setState((prev) => prev + 1)

    expect(result()).toBe(1)
  })

  it('supports atom sources through the deprecated alias', () => {
    const atom = createAtom(0)
    const { result } = renderHook(() => useStore(atom, (state) => state))

    expect(result()).toBe(0)

    atom.set((prev) => prev + 1)

    expect(result()).toBe(1)
  })
})

describe('_useStore', () => {
  it('returns selected state and actions for stores with actions', () => {
    const store = createStore({ count: 0 }, ({ setState }) => ({
      inc: () => setState((prev) => ({ count: prev.count + 1 })),
    }))

    const { result } = renderHook(() =>
      _useStore(store, (state) => state.count),
    )

    expect(result[0]()).toBe(0)

    result[1].inc()

    expect(result[0]()).toBe(1)
  })

  it('returns selected state and setState for plain stores', () => {
    const store = createStore(0)

    const { result } = renderHook(() => _useStore(store, (state) => state))

    expect(result[0]()).toBe(0)

    result[1]((prev) => prev + 1)

    expect(result[0]()).toBe(1)
  })
})

describe('shallow', () => {
  test('should return true for shallowly equal objects', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: 1, b: 'hello' }
    expect(shallow(objA, objB)).toBe(true)
  })

  test('should return false for objects with different values', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: 2, b: 'world' }
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for objects with different keys', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: 1, c: 'world' }
    // @ts-expect-error
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for objects with different structures', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = [1, 'hello']
    // @ts-expect-error
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for one object being null', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = null
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for one object being undefined', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = undefined
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return true for two null objects', () => {
    const objA = null
    const objB = null
    expect(shallow(objA, objB)).toBe(true)
  })

  test('should return false for objects with different types', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: '1', b: 'hello' }
    // @ts-expect-error
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return true for shallow equal objects with symbol keys', () => {
    const sym = Symbol.for('key')
    const objA = { [sym]: 1 }
    const objB = { [sym]: 1 }
    expect(shallow(objA, objB)).toBe(true)
  })

  test('should return false for shallow different values for symbol keys', () => {
    const sym = Symbol.for('key')
    const objA = { [sym]: 1 }
    const objB = { [sym]: 2 }
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return true for shallowly equal maps', () => {
    const objA = new Map([['1', 'hello']])
    const objB = new Map([['1', 'hello']])
    expect(shallow(objA, objB)).toBe(true)
  })

  test('should return false for maps with different values', () => {
    const objA = new Map([['1', 'hello']])
    const objB = new Map([['1', 'world']])
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return true for shallowly equal sets', () => {
    const objA = new Set([1])
    const objB = new Set([1])
    expect(shallow(objA, objB)).toBe(true)
  })

  test('should return false for sets with different values', () => {
    const objA = new Set([1])
    const objB = new Set([2])
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for dates with different values', () => {
    const objA = new Date('2025-04-10T14:48:00')
    const objB = new Date('2025-04-10T14:58:00')
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return true for equal dates', () => {
    const objA = new Date('2025-02-10')
    const objB = new Date('2025-02-10')
    expect(shallow(objA, objB)).toBe(true)
  })
})
