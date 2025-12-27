import { describe, expect, it } from 'vitest'
import { render, renderHook } from '@solidjs/testing-library'
import { createAtom } from '@xstate/store'
import { useStore } from '../src/index'

describe('useStore', () => {
  it.todo('allows us to select state using a selector', () => {
    const store = createAtom({
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
    const store = createAtom({
      select: 0,
      ignored: 1,
    })

    const { result } = renderHook(() =>
      useStore(store, (state) => state.select),
    )

    expect(result()).toBe(0)
  })

  it('updates accessor value when state is updated', () => {
    const store = createAtom(0)

    const { result } = renderHook(() => useStore(store))

    store.set((prev) => prev + 1)

    expect(result()).toBe(1)
  })

  it('updates when date changes', () => {
    const store = createAtom(new Date('2025-03-29T21:06:30.401Z'))

    const { result } = renderHook(() => useStore(store))

    store.set(() => new Date('2025-03-29T21:06:40.401Z'))

    expect(result()).toStrictEqual(new Date('2025-03-29T21:06:40.401Z'))
  })
})
