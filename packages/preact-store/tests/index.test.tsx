import { describe, expect, it, test, vi } from 'vitest'
import { render, waitFor } from '@testing-library/preact'
import { userEvent } from '@testing-library/user-event'
import { createStore } from '@tanstack/store'
import { shallow, useStore } from '../src/index'

const user = userEvent.setup()

describe('useStore', () => {
  it('allows us to select state using a selector', () => {
    const store = createStore({
      select: 0,
      ignored: 1,
    })

    function Comp() {
      const storeVal = useStore(store, (state) => state.select)

      return <p>Store: {storeVal}</p>
    }

    const { getByText } = render(<Comp />)
    expect(getByText('Store: 0')).toBeInTheDocument()
  })

  // This should ideally test the custom uSES hook
  it('only triggers a re-render when selector state is updated', async () => {
    const store = createStore({
      select: 0,
      ignored: 1,
    })

    const renderSpy = vi.fn()
    function Comp() {
      const storeVal = useStore(store, (state) => state.select)
      renderSpy()

      return (
        <div>
          <p>Number rendered: {renderSpy.mock.calls.length}</p>
          <p>Store: {storeVal}</p>
          <button
            type="button"
            onClick={() =>
              store.setState((v) => ({
                ...v,
                select: 10,
              }))
            }
          >
            Update select
          </button>
          <button
            type="button"
            onClick={() =>
              store.setState((v) => ({
                ...v,
                ignored: 10,
              }))
            }
          >
            Update ignored
          </button>
        </div>
      )
    }

    const { getByText } = render(<Comp />)
    expect(getByText('Store: 0')).toBeInTheDocument()
    expect(getByText('Number rendered: 1')).toBeInTheDocument()

    await user.click(getByText('Update select'))

    await waitFor(() => expect(getByText('Store: 10')).toBeInTheDocument())
    expect(getByText('Number rendered: 2')).toBeInTheDocument()

    await user.click(getByText('Update ignored'))
    expect(getByText('Number rendered: 2')).toBeInTheDocument()
  })

  it('allow specifying custom equality function', async () => {
    const store = createStore({
      array: [
        { select: 0, ignore: 1 },
        { select: 0, ignore: 1 },
      ],
    })

    function deepEqual<T>(objA: T, objB: T) {
      return JSON.stringify(objA) === JSON.stringify(objB)
    }

    const renderSpy = vi.fn()
    function Comp() {
      const storeVal = useStore(
        store,
        (state) => state.array.map(({ ignore, ...rest }) => rest),
        { equal: deepEqual },
      )
      renderSpy()

      const value = storeVal
        .map((item) => item.select)
        .reduce((total, num) => total + num, 0)

      return (
        <div>
          <p>Number rendered: {renderSpy.mock.calls.length}</p>
          <p>Store: {value}</p>
          <button
            type="button"
            onClick={() =>
              store.setState((v) => ({
                array: v.array.map((item) => ({
                  ...item,
                  select: item.select + 5,
                })),
              }))
            }
          >
            Update select
          </button>
          <button
            type="button"
            onClick={() =>
              store.setState((v) => ({
                array: v.array.map((item) => ({
                  ...item,
                  ignore: item.ignore + 2,
                })),
              }))
            }
          >
            Update ignored
          </button>
        </div>
      )
    }

    const { getByText } = render(<Comp />)
    expect(getByText('Store: 0')).toBeInTheDocument()
    expect(getByText('Number rendered: 1')).toBeInTheDocument()

    await user.click(getByText('Update select'))

    await waitFor(() => expect(getByText('Store: 10')).toBeInTheDocument())
    expect(getByText('Number rendered: 2')).toBeInTheDocument()

    await user.click(getByText('Update ignored'))
    expect(getByText('Number rendered: 2')).toBeInTheDocument()
  })

  it('works with mounted derived stores', async () => {
    const store = createStore(0)

    const derived = createStore(() => store.state * 2)

    function Comp() {
      const derivedVal = useStore(derived, (state) => state)

      return (
        <div>
          <p>Derived: {derivedVal}</p>
          <button type="button" onClick={() => store.setState((v) => v + 1)}>
            Update select
          </button>
        </div>
      )
    }

    const { getByText } = render(<Comp />)
    expect(getByText('Derived: 0')).toBeInTheDocument()

    await user.click(getByText('Update select'))

    await waitFor(() => expect(getByText('Derived: 2')).toBeInTheDocument())
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

  test('should return true for non-enumerable keys', () => {
    const objA = {}
    const objB = {}

    Object.defineProperty(objA, 'a', {
      enumerable: false,
      value: 1,
    })

    Object.defineProperty(objB, 'a', {
      enumerable: false,
      value: 2,
    })

    expect(shallow(objA, objB)).toBe(true)
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
