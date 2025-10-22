import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Store } from '../src'

interface TestState {
  count: number
  text: string
}

describe('Store Persistence', () => {
  let mockStorage: {
    storage: Record<string, string>
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
    removeItem: (key: string) => void
  }

  beforeEach(() => {
    mockStorage = {
      storage: {},
      getItem: vi.fn((key: string) => mockStorage.storage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage.storage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage.storage[key]
      }),
    }
  })

  it('should initialize with initial state when no persisted state exists', () => {
    const initialState: TestState = { count: 0, text: 'initial' }
    const store = new Store(initialState, {
      persist: {
        key: 'test-store',
        storage: mockStorage,
      },
    })

    expect(store.state).toEqual(initialState)
    expect(mockStorage.getItem).toHaveBeenCalledWith('test-store')
  })

  it('should persist state updates', () => {
    const store = new Store(
      { count: 0, text: 'initial' },
      {
        persist: {
          key: 'test-store',
          storage: mockStorage,
        },
      },
    )

    store.setState({ count: 1, text: 'updated' })

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'test-store',
      JSON.stringify({ count: 1, text: 'updated' }),
    )
  })

  it('should use custom serializer and deserializer', () => {
    const customSerializer = vi.fn(
      (state: TestState) => `count:${state.count};text:${state.text}`,
    )
    const customDeserializer = vi.fn((str: string) => {
      const [countPart, textPart] = str.split(';')
      if (!countPart || !textPart) {
        throw new Error('Invalid format')
      }
      const count = Number(countPart.split(':')[1])
      const text = textPart.split(':')[1]
      if (typeof text !== 'string') {
        throw new Error('Invalid format')
      }
      return {
        count,
        text,
      }
    })

    mockStorage.storage['test-store'] = 'count:42;text:persisted'

    const store = new Store(
      { count: 0, text: 'initial' },
      {
        persist: {
          key: 'test-store',
          storage: mockStorage,
          serialize: customSerializer,
          deserialize: customDeserializer,
        },
      },
    )

    expect(store.state).toEqual({ count: 42, text: 'persisted' })
    expect(customDeserializer).toHaveBeenCalledWith('count:42;text:persisted')

    store.setState({ count: 100, text: 'serialized' })
    expect(customSerializer).toHaveBeenCalledWith({
      count: 100,
      text: 'serialized',
    })
  })

  it('should handle storage errors gracefully', () => {
    const errorStorage = {
      getItem: vi.fn(() => {
        throw new Error('Storage error')
      }),
      setItem: vi.fn(() => {
        throw new Error('Storage error')
      }),
      removeItem: vi.fn(() => {
        throw new Error('Storage error')
      }),
    }

    const initialState = { count: 0, text: 'initial' }
    const store = new Store(initialState, {
      persist: {
        key: 'test-store',
        storage: errorStorage,
      },
    })

    expect(store.state).toEqual(initialState)
    expect(() => store.setState({ count: 1, text: 'updated' })).not.toThrow()
  })

  it('should clear persisted state', () => {
    const store = new Store(
      { count: 0, text: 'initial' },
      {
        persist: {
          key: 'test-store',
          storage: mockStorage,
        },
      },
    )

    store.clearPersistedState()
    expect(mockStorage.removeItem).toHaveBeenCalledWith('test-store')
  })

  it('should manually persist state', () => {
    const store = new Store(
      { count: 0, text: 'initial' },
      {
        persist: {
          key: 'test-store',
          storage: mockStorage,
        },
      },
    )

    vi.clearAllMocks()

    store.persist()
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'test-store',
      JSON.stringify({ count: 0, text: 'initial' }),
    )
  })

  it('should rehydrate state from storage', () => {
    const store = new Store(
      { count: 0, text: 'initial' },
      {
        persist: {
          key: 'test-store',
          storage: mockStorage,
        },
      },
    )

    mockStorage.storage['test-store'] = JSON.stringify({
      count: 42,
      text: 'rehydrated',
    })

    const success = store.rehydrate()
    expect(success).toBe(true)
    expect(store.state).toEqual({ count: 42, text: 'rehydrated' })
  })

  it('should return false when rehydration fails', () => {
    const store = new Store(
      { count: 0, text: 'initial' },
      {
        persist: {
          key: 'test-store',
          storage: mockStorage,
        },
      },
    )

    const success = store.rehydrate()
    expect(success).toBe(false)
    expect(store.state).toEqual({ count: 0, text: 'initial' })
  })

  it('should work without persistence options', () => {
    const store = new Store({ count: 0, text: 'initial' })

    store.persist()
    store.rehydrate()
    store.clearPersistedState()

    expect(store.state).toEqual({ count: 0, text: 'initial' })
  })
})
