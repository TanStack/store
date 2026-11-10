import { describe, expect, test, vi } from 'vitest'
import { createAsyncAtom, createAtom } from '../src'

describe('async atoms', () => {
  test('keeps its input after fulfillment and successive updates', async () => {
    const input = createAtom('alice')
    const getter = vi.fn(() => Promise.resolve(input.get()))
    const atom = createAsyncAtom(getter)
    const observer = vi.fn()
    const subscription = atom.subscribe(observer)

    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'done', data: 'alice' })
    expect(observer).toHaveBeenLastCalledWith({ status: 'done', data: 'alice' })

    input.set('bob')
    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'done', data: 'bob' })
    expect(observer).toHaveBeenLastCalledWith({ status: 'done', data: 'bob' })

    input.set('carol')
    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'done', data: 'carol' })
    expect(getter).toHaveBeenCalledTimes(3)

    subscription.unsubscribe()
    observer.mockClear()
    input.set('dave')
    await Promise.resolve()
    expect(getter).toHaveBeenCalledTimes(3)
    expect(observer).not.toHaveBeenCalled()
  })

  test('keeps its input after a null result', async () => {
    const input = createAtom<string | null>(null)
    const atom = createAsyncAtom(() => Promise.resolve(input.get()))
    const subscription = atom.subscribe(() => {})

    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'done', data: null })
    input.set('bob')
    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'done', data: 'bob' })
    subscription.unsubscribe()
  })

  test('can recover after rejection when its input changes', async () => {
    const input = createAtom(false)
    const error = new Error('try again')
    const atom = createAsyncAtom(() =>
      input.get() ? Promise.resolve('recovered') : Promise.reject(error),
    )
    const observer = vi.fn()
    const subscription = atom.subscribe(observer)

    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'error', error })
    expect(observer).toHaveBeenLastCalledWith({ status: 'error', error })
    input.set(true)
    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'done', data: 'recovered' })
    expect(observer).toHaveBeenLastCalledWith({
      status: 'done',
      data: 'recovered',
    })
    subscription.unsubscribe()
  })

  test('retains computed inputs and prunes dependencies when reevaluated', async () => {
    const useFirst = createAtom(true)
    const first = createAtom('alice')
    const second = createAtom('bob')
    const computed = createAtom(() => first.get().toUpperCase())
    const getter = vi.fn(() =>
      Promise.resolve(useFirst.get() ? computed.get() : second.get()),
    )
    const atom = createAsyncAtom(getter)
    const subscription = atom.subscribe(() => {})

    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'done', data: 'ALICE' })
    first.set('carol')
    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'done', data: 'CAROL' })

    useFirst.set(false)
    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'done', data: 'bob' })
    first.set('dave')
    await Promise.resolve()
    expect(getter).toHaveBeenCalledTimes(3)
    second.set('eve')
    await Promise.resolve()
    expect(atom.get()).toEqual({ status: 'done', data: 'eve' })
    expect(getter).toHaveBeenCalledTimes(4)
    subscription.unsubscribe()
  })

  test('retains inputs when comparison suppresses a settled result', async () => {
    const input = createAtom(0)
    const getter = vi.fn(() => Promise.resolve(input.get()))
    const atom = createAsyncAtom(getter, {
      compare: (previous, next) =>
        next.status === 'pending' ||
        (previous.status === 'done' &&
          next.status === 'done' &&
          previous.data % 2 === next.data % 2),
    })
    const observer = vi.fn()
    const subscription = atom.subscribe(observer)

    await Promise.resolve()
    observer.mockClear()
    input.set(2)
    await Promise.resolve()
    expect(observer).not.toHaveBeenCalled()
    expect(atom.get()).toEqual({ status: 'done', data: 0 })

    input.set(3)
    await Promise.resolve()
    expect(getter).toHaveBeenCalledTimes(3)
    expect(atom.get()).toEqual({ status: 'done', data: 3 })
    expect(observer).toHaveBeenCalledTimes(1)
    subscription.unsubscribe()
  })

  test('ordinary computed atoms still prune unused dependencies', () => {
    const useFirst = createAtom(true)
    const first = createAtom('alice')
    const second = createAtom('bob')
    const getter = vi.fn(() => (useFirst.get() ? first.get() : second.get()))
    const atom = createAtom(getter)
    const subscription = atom.subscribe(() => {})

    useFirst.set(false)
    expect(atom.get()).toBe('bob')
    first.set('carol')
    expect(getter).toHaveBeenCalledTimes(2)
    second.set('dave')
    expect(atom.get()).toBe('dave')
    expect(getter).toHaveBeenCalledTimes(3)
    subscription.unsubscribe()
  })
})
