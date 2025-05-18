import { describe, expect, it } from 'vitest'
import { render, renderHook } from '@solidjs/testing-library'
import { Store } from '@tanstack/store'
import { useStore } from '../src/index'
import { createSignal } from 'solid-js'

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

  it('updates when updating to a new store in a signal', () => {
    const { result } = renderHook(() => {
      const [signal, setSignal] = createSignal({ store: new Store(0) })

      return { value: useStore(signal().store), setSignal }
    })

    expect(result.value()).toBe(0)
    result.setSignal((prev) => {
      return { store: new Store(prev.store.state + 1) }
    })

    expect(result.value()).toBe(1)
  })
})
