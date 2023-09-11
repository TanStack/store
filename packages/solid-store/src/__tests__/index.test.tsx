import { renderHook } from '@solidjs/testing-library'
import { Store } from '@tanstack/store'
import { useStore } from '../index'

describe('useStore', () => {
  it('allows us to select state using a selector', async () => {
    const store = new Store({
      select: 0,
      ignored: 1,
    })

    const { result } = renderHook(() => useStore(store, (state) => state.select))
    
    expect(result()).toBe(0)
  })
})
