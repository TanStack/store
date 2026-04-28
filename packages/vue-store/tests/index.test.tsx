import { describe, expect, it, test, vi } from 'vitest'
import { defineComponent, h } from 'vue-demi'
import { render, waitFor } from '@testing-library/vue'
import { createAtom, createStore } from '@tanstack/store'
import { userEvent } from '@testing-library/user-event'
import {
  _useStore,
  evaluate,
  useAtom,
  useSelector,
  useStore,
} from '../src/index'

const user = userEvent.setup()

describe('atom hooks', () => {
  it('useSelector reads mutable atom state and rerenders when updated', async () => {
    const atom = createAtom(0)

    const Comp = defineComponent(() => {
      const value = useSelector(atom)

      return () =>
        h('div', [
          h('p', `Value: ${value.value}`),
          h(
            'button',
            {
              onClick: () => atom.set((prev) => prev + 1),
            },
            'Update',
          ),
        ])
    })

    const { getByText } = render(Comp)
    expect(getByText('Value: 0')).toBeInTheDocument()

    await user.click(getByText('Update'))

    await waitFor(() => expect(getByText('Value: 1')).toBeInTheDocument())
  })

  it('useAtom returns the current ref and setter', async () => {
    const atom = createAtom(0)

    const Comp = defineComponent(() => {
      const [value, setValue] = useAtom(atom)

      return () =>
        h('div', [
          h('p', `Value: ${value.value}`),
          h(
            'button',
            {
              onClick: () => setValue((prev) => prev + 5),
            },
            'Add 5',
          ),
        ])
    })

    const { getByText } = render(Comp)
    expect(getByText('Value: 0')).toBeInTheDocument()

    await user.click(getByText('Add 5'))

    await waitFor(() => expect(getByText('Value: 5')).toBeInTheDocument())
  })
})

describe('store hooks', () => {
  it('allows us to select state using a selector', () => {
    const store = createStore({
      select: 0,
      ignored: 1,
    })

    const Comp = defineComponent(() => {
      const storeVal = useSelector(store, (state) => state.select)

      return () => h('p', `Store: ${storeVal.value}`)
    })

    const { getByText } = render(Comp)
    expect(getByText('Store: 0')).toBeInTheDocument()
  })

  it('useSelector reads writable and readonly store state', async () => {
    const baseStore = createStore(1)
    const readonlyStore = createStore(() => ({ value: baseStore.state * 2 }))

    const Comp = defineComponent(() => {
      const value = useSelector(baseStore)
      const readonlyValue = useSelector(readonlyStore)

      return () =>
        h('div', [
          h('p', `Value: ${value.value}`),
          h('p', `Readonly: ${readonlyValue.value.value}`),
          h(
            'button',
            {
              onClick: () => baseStore.setState((prev) => prev + 1),
            },
            'Update',
          ),
        ])
    })

    const { getByText } = render(Comp)
    expect(getByText('Value: 1')).toBeInTheDocument()
    expect(getByText('Readonly: 2')).toBeInTheDocument()

    await user.click(getByText('Update'))

    await waitFor(() => expect(getByText('Value: 2')).toBeInTheDocument())
    await waitFor(() => expect(getByText('Readonly: 4')).toBeInTheDocument())
  })

  it('only triggers a re-render when selector state is updated', async () => {
    const store = createStore({
      select: 0,
      ignored: 1,
    })

    const Comp = defineComponent(() => {
      const storeVal = useSelector(store, (state) => state.select)
      const fn = vi.fn()

      return () => {
        fn()
        return h('div', [
          h('p', `Number rendered: ${fn.mock.calls.length}`),
          h('p', `Store: ${storeVal.value}`),
          h(
            'button',
            {
              onClick: () =>
                store.setState((v) => ({
                  ...v,
                  select: 10,
                })),
            },
            'Update select',
          ),
          h(
            'button',
            {
              onClick: () =>
                store.setState((v) => ({
                  ...v,
                  ignored: 10,
                })),
            },
            'Update ignored',
          ),
        ])
      }
    })

    const { getByText } = render(Comp)
    expect(getByText('Store: 0')).toBeInTheDocument()
    expect(getByText('Number rendered: 1')).toBeInTheDocument()

    await user.click(getByText('Update select'))

    await waitFor(() => expect(getByText('Store: 10')).toBeInTheDocument())
    expect(getByText('Number rendered: 2')).toBeInTheDocument()

    await user.click(getByText('Update ignored'))
    expect(getByText('Number rendered: 2')).toBeInTheDocument()
  })

  it('useSelector allows specifying a custom equality function', async () => {
    const store = createStore({
      array: [
        { select: 0, ignore: 1 },
        { select: 0, ignore: 1 },
      ],
    })

    const Comp = defineComponent(() => {
      const storeVal = useSelector(
        store,
        (state) => state.array.map(({ ignore, ...rest }) => rest),
        {
          compare: (prev, next) =>
            JSON.stringify(prev) === JSON.stringify(next),
        },
      )
      const fn = vi.fn()

      return () => {
        fn()
        const value = storeVal.value
          .map((item) => item.select)
          .reduce((total, num) => total + num, 0)

        return h('div', [
          h('p', `Number rendered: ${fn.mock.calls.length}`),
          h('p', `Store: ${value}`),
          h(
            'button',
            {
              onClick: () =>
                store.setState((v) => ({
                  array: v.array.map((item) => ({
                    ...item,
                    select: item.select + 5,
                  })),
                })),
            },
            'Update select',
          ),
          h(
            'button',
            {
              onClick: () =>
                store.setState((v) => ({
                  array: v.array.map((item) => ({
                    ...item,
                    ignore: item.ignore + 2,
                  })),
                })),
            },
            'Update ignored',
          ),
        ])
      }
    })

    const { getByText } = render(Comp)
    expect(getByText('Store: 0')).toBeInTheDocument()
    expect(getByText('Number rendered: 1')).toBeInTheDocument()

    await user.click(getByText('Update select'))

    await waitFor(() => expect(getByText('Store: 10')).toBeInTheDocument())
    expect(getByText('Number rendered: 2')).toBeInTheDocument()

    await user.click(getByText('Update ignored'))
    expect(getByText('Number rendered: 2')).toBeInTheDocument()
  })

  it('useSelector works with mounted derived stores', async () => {
    const store = createStore(0)
    const derived = createStore(() => ({ val: store.state * 2 }))

    const Comp = defineComponent(() => {
      const derivedVal = useSelector(derived, (state) => state.val)

      return () =>
        h('div', [
          h('p', `Derived: ${derivedVal.value}`),
          h(
            'button',
            {
              onClick: () => store.setState((prev) => prev + 1),
            },
            'Update',
          ),
        ])
    })

    const { getByText } = render(Comp)
    expect(getByText('Derived: 0')).toBeInTheDocument()

    await user.click(getByText('Update'))

    await waitFor(() => expect(getByText('Derived: 2')).toBeInTheDocument())
  })
})

describe('useStore', () => {
  it('is a compatibility alias for useSelector', async () => {
    const store = createStore(0)

    const Comp = defineComponent(() => {
      const value = useStore(store, (state) => state)

      return () =>
        h('div', [
          h('p', `Value: ${value.value}`),
          h(
            'button',
            {
              onClick: () => store.setState((prev) => prev + 1),
            },
            'Update',
          ),
        ])
    })

    const { getByText } = render(Comp)
    expect(getByText('Value: 0')).toBeInTheDocument()

    await user.click(getByText('Update'))

    await waitFor(() => expect(getByText('Value: 1')).toBeInTheDocument())
  })

  it('supports atom sources through the deprecated alias', async () => {
    const atom = createAtom(0)

    const Comp = defineComponent(() => {
      const value = useStore(atom, (state) => state)

      return () =>
        h('div', [
          h('p', `Value: ${value.value}`),
          h(
            'button',
            {
              onClick: () => atom.set((prev) => prev + 1),
            },
            'Update',
          ),
        ])
    })

    const { getByText } = render(Comp)
    expect(getByText('Value: 0')).toBeInTheDocument()

    await user.click(getByText('Update'))

    await waitFor(() => expect(getByText('Value: 1')).toBeInTheDocument())
  })
})

describe('_useStore', () => {
  it('returns selected state and actions for stores with actions', async () => {
    const store = createStore({ count: 0 }, ({ setState }) => ({
      inc: () => setState((prev) => ({ count: prev.count + 1 })),
    }))

    const Comp = defineComponent(() => {
      const [count, { inc }] = _useStore(store, (state) => state.count)

      return () =>
        h('div', [
          h('p', `Count: ${count.value}`),
          h('button', { onClick: () => inc() }, 'Inc'),
        ])
    })

    const { getByText } = render(Comp)
    expect(getByText('Count: 0')).toBeInTheDocument()

    await user.click(getByText('Inc'))

    await waitFor(() => expect(getByText('Count: 1')).toBeInTheDocument())
  })

  it('returns selected state and setState for plain stores', async () => {
    const store = createStore(0)

    const Comp = defineComponent(() => {
      const [value, setState] = _useStore(store, (state) => state)

      return () =>
        h('div', [
          h('p', `Value: ${value.value}`),
          h('button', { onClick: () => setState((prev) => prev + 1) }, 'Inc'),
        ])
    })

    const { getByText } = render(Comp)
    expect(getByText('Value: 0')).toBeInTheDocument()

    await user.click(getByText('Inc'))

    await waitFor(() => expect(getByText('Value: 1')).toBeInTheDocument())
  })
})

describe('shallow', () => {
  test('should return true for shallowly equal objects', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: 1, b: 'hello' }
    expect(evaluate(objA, objB)).toBe(true)
  })

  test('should return false for objects with different values', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: 2, b: 'world' }
    expect(evaluate(objA, objB)).toBe(false)
  })

  test('should return false for objects with different keys', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: 1, c: 'world' }
    // @ts-expect-error
    expect(evaluate(objA, objB)).toBe(false)
  })

  test('should return false for objects with different structures', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = [1, 'hello']
    // @ts-expect-error
    expect(evaluate(objA, objB)).toBe(false)
  })

  test('should return false for one object being null', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = null
    expect(evaluate(objA, objB)).toBe(false)
  })

  test('should return false for one object being undefined', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = undefined
    expect(evaluate(objA, objB)).toBe(false)
  })

  test('should return true for two null objects', () => {
    const objA = null
    const objB = null
    expect(evaluate(objA, objB)).toBe(true)
  })

  test('should return false for objects with different types', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: '1', b: 'hello' }
    // @ts-expect-error
    expect(evaluate(objA, objB)).toBe(false)
  })

  test('should return true for shallow equal objects with symbol keys', () => {
    const sym = Symbol.for('key')
    const objA = { [sym]: 1 }
    const objB = { [sym]: 1 }
    expect(evaluate(objA, objB)).toBe(true)
  })

  test('should return false for shallow different values for symbol keys', () => {
    const sym = Symbol.for('key')
    const objA = { [sym]: 1 }
    const objB = { [sym]: 2 }
    expect(evaluate(objA, objB)).toBe(false)
  })

  test('should return true for shallowly equal maps', () => {
    const objA = new Map([['1', 'hello']])
    const objB = new Map([['1', 'hello']])
    expect(evaluate(objA, objB)).toBe(true)
  })

  test('should return false for maps with different values', () => {
    const objA = new Map([['1', 'hello']])
    const objB = new Map([['1', 'world']])
    expect(evaluate(objA, objB)).toBe(false)
  })

  test('should return true for shallowly equal sets', () => {
    const objA = new Set([1])
    const objB = new Set([1])
    expect(evaluate(objA, objB)).toBe(true)
  })

  test('should return false for sets with different values', () => {
    const objA = new Set([1])
    const objB = new Set([2])
    expect(evaluate(objA, objB)).toBe(false)
  })

  test('should return false for dates with different values', () => {
    const objA = new Date('2025-04-10T14:48:00')
    const objB = new Date('2025-04-10T14:58:00')
    expect(evaluate(objA, objB)).toBe(false)
  })

  test('should return true for equal dates', () => {
    const objA = new Date('2025-02-10')
    const objB = new Date('2025-02-10')
    expect(evaluate(objA, objB)).toBe(true)
  })
})
