import { describe, expect, test, vi } from 'vitest'
import { createAtom, createStore } from '../src'

function setup(initialValue = 1) {
  const input = createAtom(initialValue)
  const error = new Error('negative')
  const getter = vi.fn(() => {
    const value = input.get()
    if (value < 0) {
      throw error
    }
    return value * 2
  })
  return { input, computed: createAtom(getter), getter, error }
}

describe('computed atom errors', () => {
  test('reports a getter error to observers without throwing from set()', () => {
    const { input, computed, error } = setup()
    const next = vi.fn()
    const onError = vi.fn()
    const subscription = computed.subscribe({ next, error: onError })
    try {
      expect(() => input.set(-1)).not.toThrow()
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError.mock.calls[0]?.[0]).toBe(error)
      expect(next).not.toHaveBeenCalled()
    } finally {
      subscription.unsubscribe()
    }
  })

  test.each(['atom', 'store'])(
    'reports getter errors to a separate callback for a computed %s',
    (sourceType) => {
      const { input, getter, error } = setup()
      const source =
        sourceType === 'atom' ? createAtom(getter) : createStore(getter)
      const next = vi.fn()
      const onError = vi.fn()
      const subscription = source.subscribe(next, onError)
      try {
        input.set(-1)
        expect(onError).toHaveBeenCalledExactlyOnceWith(error)
        expect(next).not.toHaveBeenCalled()
        input.set(2)
        expect(next).toHaveBeenCalledExactlyOnceWith(4)
      } finally {
        subscription.unsubscribe()
      }
    },
  )

  test('notifies subscribers again even when a computed dependency recovers to the same value', () => {
    const { input, computed, error } = setup()
    const derived = createAtom(() => computed.get() + 1)
    const next = vi.fn()
    const subscription = derived.subscribe(next)
    try {
      try {
        input.set(-1)
      } catch (caught) {
        expect(caught).toBe(error)
      }
      input.set(1)
      expect(derived.get()).toBe(3)
      input.set(2)
      expect(next.mock.calls).toEqual([[3], [5]])
    } finally {
      subscription.unsubscribe()
    }
  })

  test('throws on every read after invalidation, until the input recovers', () => {
    const { input, computed, getter, error } = setup()
    expect(computed.get()).toBe(2)

    input.set(-1)
    expect(() => computed.get()).toThrow(error)
    expect(() => computed.get()).toThrow(error)
    expect(getter).toHaveBeenCalledTimes(2)

    input.set(2)
    expect(computed.get()).toBe(4)
  })

  test('caches an initial error and notifies a new subscriber when the getter recovers', () => {
    const { input, computed, getter, error } = setup(-1)
    expect(() => computed.get()).toThrow(error)
    expect(() => computed.get()).toThrow(error)
    expect(getter).toHaveBeenCalledTimes(1)

    const next = vi.fn()
    const onError = vi.fn()
    const subscription = computed.subscribe({ next, error: onError })
    try {
      expect(onError).toHaveBeenCalledWith(error)
      expect(next).not.toHaveBeenCalled()
      input.set(1)
      expect(next).toHaveBeenCalledWith(2)
    } finally {
      subscription.unsubscribe()
    }
  })
})
