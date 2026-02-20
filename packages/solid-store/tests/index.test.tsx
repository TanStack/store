import { describe, expect, it } from 'vitest'
import { render, renderHook } from '@solidjs/testing-library'
import { createStore } from '@tanstack/store'
import { Temporal } from 'temporal-polyfill'
import { shallow, useStore } from '../src/index'

describe('useStore', () => {
  it.todo('allows us to select state using a selector', () => {
    const store = createStore({
      select: 0,
      ignored: 1,
    })

    function Comp() {
      const storeVal = useStore(store, (state) => state.select)

      return <p>Store: {storeVal()}</p>
    }

    const { getByText } = render(() => <Comp />)
    expect(getByText('Store: 0')).toBeInTheDocument()
  })

  it('allows us to select state using a selector', () => {
    const store = createStore({
      select: 0,
      ignored: 1,
    })

    const { result } = renderHook(() =>
      useStore(store, (state) => state.select),
    )

    expect(result()).toBe(0)
  })

  it('updates accessor value when state is updated', () => {
    const store = createStore(0)

    const { result } = renderHook(() => useStore(store))

    store.setState((prev) => prev + 1)

    expect(result()).toBe(1)
  })

  it('updates when date changes', () => {
    const store = createStore(new Date('2025-03-29T21:06:30.401Z'))

    const { result } = renderHook(() => useStore(store))

    store.setState(() => new Date('2025-03-29T21:06:40.401Z'))

    expect(result()).toStrictEqual(new Date('2025-03-29T21:06:40.401Z'))
  })

  it('updates when temporal value changes', () => {
    const store = createStore({
      date: Temporal.PlainDate.from('2025-03-29'),
    })

    const { result } = renderHook(() => useStore(store, (state) => state.date))

    store.setState((v) => ({
      ...v,
      date: Temporal.PlainDate.from('2025-03-30'),
    }))

    expect(result().toString()).toBe('2025-03-30')
  })
})

describe('shallow', () => {
  it('returns false for temporal objects with different values', () => {
    const objA = Temporal.PlainDate.from('2025-02-10')
    const objB = Temporal.PlainDate.from('2025-02-11')
    expect(shallow(objA, objB)).toBe(false)
  })

  it('returns true for temporal objects with equal values', () => {
    const objA = Temporal.PlainDate.from('2025-02-10')
    const objB = Temporal.PlainDate.from('2025-02-10')
    expect(shallow(objA, objB)).toBe(true)
  })
})
