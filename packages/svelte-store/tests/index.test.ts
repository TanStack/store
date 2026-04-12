import { describe, expect, it, test } from 'vitest'
import { render, waitFor } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { createStore } from '@tanstack/store'
import { shallow, useStoreActions } from '../src/index.svelte.js'
import TestBaseStore from './BaseStore.test.svelte'
import TestRerender from './Render.test.svelte'
import TestValue from './Value.test.svelte'

const user = userEvent.setup()

describe('useSelector', () => {
  it('allows us to select state using a selector', () => {
    const { getByText } = render(TestBaseStore)
    expect(getByText('Store: 0')).toBeInTheDocument()
  })

  it('only triggers a re-render when selector state is updated', async () => {
    const { getByText } = render(TestRerender)
    expect(getByText('Store: 0')).toBeInTheDocument()
    expect(getByText('Number rendered: 1')).toBeInTheDocument()

    await user.click(getByText('Update select'))

    await waitFor(() => expect(getByText('Store: 10')).toBeInTheDocument())
    expect(getByText('Number rendered: 2')).toBeInTheDocument()

    await user.click(getByText('Update ignored'))
    expect(getByText('Number rendered: 2')).toBeInTheDocument()
  })

  it('useValue reads writable and readonly store state', async () => {
    const { getByText } = render(TestValue)
    expect(getByText('Value: 1')).toBeInTheDocument()
    expect(getByText('Readonly: 2')).toBeInTheDocument()

    await user.click(getByText('Update'))

    await waitFor(() => expect(getByText('Value: 2')).toBeInTheDocument())
    await waitFor(() => expect(getByText('Readonly: 4')).toBeInTheDocument())
  })

  it('useStoreActions returns the stable actions bag', () => {
    const store = createStore({ count: 0 }, ({ set }) => ({
      inc: () => set((prev) => ({ count: prev.count + 1 })),
    }))

    const actions = useStoreActions(store)
    actions.inc()

    expect(store.state.count).toBe(1)
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
    // @ts-expect-error testing invalid input
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for objects with different structures', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = [1, 'hello']
    // @ts-expect-error testing invalid input
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
    // @ts-expect-error testing invalid input
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
