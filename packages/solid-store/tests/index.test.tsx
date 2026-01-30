import { describe, expect, it, test } from 'vitest'
import { render, renderHook } from '@solidjs/testing-library'
import { Store } from '@tanstack/store'
import { Temporal } from 'temporal-polyfill'
import { shallow, useStore } from '../src/index'

describe('useStore', () => {
  it.todo('allows us to select state using a selector', () => {
    const store = new Store({
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
    const store = new Store({
      select: 0,
      ignored: 1,
    })

    const { result } = renderHook(() =>
      useStore(store, (state) => state.select),
    )

    expect(result()).toBe(0)
  })

  it('updates accessor value when state is updated', () => {
    const store = new Store(0)

    const { result } = renderHook(() => useStore(store))

    store.setState((prev) => prev + 1)

    expect(result()).toBe(1)
  })

  it('updates when date changes', () => {
    const store = new Store(new Date('2025-03-29T21:06:30.401Z'))

    const { result } = renderHook(() => useStore(store))

    store.setState(() => new Date('2025-03-29T21:06:40.401Z'))

    expect(result()).toStrictEqual(new Date('2025-03-29T21:06:40.401Z'))
  })
})

describe('shallow', () => {
  test('should return false for empty object vs empty array', () => {
    expect(shallow({}, [])).toBe(false)
  })

  test('should return false for temporal objects with different values', () => {
    const objA = Temporal.PlainDate.from('2025-02-10')
    const objB = Temporal.PlainDate.from('2025-02-11')
    expect(shallow(objA, objB)).toBe(false)
  })
})
