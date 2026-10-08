import { describe, expect, test } from 'vitest'
import { createAtom } from '../src'

describe('Subscription dependency isolation', () => {
  test.each(['function', 'object'])(
    'reading another atom does not subscribe the %s observer to it',
    (observerType) => {
      const source = createAtom(0)
      const unrelated = createAtom(0)
      const seen: Array<number> = []
      const next = (value: number) => {
        unrelated.get()
        seen.push(value)
      }
      const subscription =
        observerType === 'function'
          ? source.subscribe(next)
          : source.subscribe({ next })

      source.set(1)
      expect(seen).toEqual([1])
      unrelated.set(1)
      expect(seen).toEqual([1])
      source.set(2)
      expect(seen).toEqual([1, 2])
      subscription.unsubscribe()
      source.set(3)
      expect(seen).toEqual([1, 2])
    },
  )

  test('computed sources retain their dependencies without observer reads', () => {
    const input = createAtom(1)
    const unrelated = createAtom(0)
    const source = createAtom(() => input.get() * 2)
    const seen: Array<number> = []
    const subscription = source.subscribe((value) => {
      unrelated.get()
      seen.push(value)
    })

    input.set(2)
    unrelated.set(1)
    expect(seen).toEqual([4])
    input.set(3)
    expect(seen).toEqual([4, 6])
    subscription.unsubscribe()
  })

  test('nested observer return restores the enclosing computed dependency', () => {
    const source = createAtom(0)
    const unrelated = createAtom(0)
    const input = createAtom(1)
    const subscription = source.subscribe(() => {
      unrelated.get()
    })
    let fired = false
    const computed = createAtom(() => {
      if (!fired) {
        fired = true
        source.set(1)
      }
      return input.get() * 2
    })
    const seen: Array<number> = []
    const derivedSubscription = computed.subscribe((value) => {
      seen.push(value)
    })

    input.set(2)
    expect(computed.get()).toBe(4)
    expect(seen).toEqual([4])
    unrelated.set(1)
    expect(seen).toEqual([4])
    subscription.unsubscribe()
    derivedSubscription.unsubscribe()
  })

  test('a caught observer error restores the enclosing computed dependency', () => {
    const source = createAtom(0)
    const input = createAtom(1)
    const error = new Error('observer failed')
    const subscription = source.subscribe(() => {
      throw error
    })
    let fired = false
    const computed = createAtom(() => {
      if (!fired) {
        fired = true
        try {
          source.set(1)
        } catch (caught) {
          expect(caught).toBe(error)
        }
      }
      return input.get() * 2
    })
    const seen: Array<number> = []
    const derivedSubscription = computed.subscribe((value) => {
      seen.push(value)
    })

    input.set(2)
    expect(computed.get()).toBe(4)
    expect(seen).toEqual([4])
    subscription.unsubscribe()
    derivedSubscription.unsubscribe()
  })

  test('reading an unobserved computed atom does not retain it in source dependencies', () => {
    const source = createAtom(0) as any
    const derived = createAtom(() => source.get() + 1)
    expect(derived.get()).toBe(1)
    expect(source.subs).toBeUndefined()

    source.set(10)
    expect(derived.get()).toBe(11)
    expect(source.subs).toBeUndefined()
  })
})
