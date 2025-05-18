import { describe, expect, it, test } from 'vitest'
import { render, waitFor } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { shallow } from '../src/index.svelte.js'
import TestBaseStore from './BaseStore.test.svelte'
import DynamicStore from './DynamicStore.test.svelte'
import TestRerender from './Render.test.svelte'

const user = userEvent.setup()

describe('useStore', () => {
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

  it('allows us to use a dynamic store', async () => {
    const { getByText } = render(DynamicStore)
    expect(getByText('Store: 0')).toBeInTheDocument()

    await user.click(getByText('Update store'))
    await waitFor(() => expect(getByText('Store: 10')).toBeInTheDocument())
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
})
