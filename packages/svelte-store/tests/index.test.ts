import { describe, expect, it, test, vi } from 'vitest'
import { render, waitFor } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { shallow } from '../src/index.svelte.js'
import TestBaseStore from './BaseStore.test.svelte'
import TestRerender from './Render.test.svelte'
import TestValue from './Value.test.svelte'
import TestProxyEquality from './ProxyEquality.test.svelte'
import TestSelectorMemoization from './SelectorMemoization.test.svelte'

const user = userEvent.setup()

/** Three updates that leave the selected slice untouched, each clicked
 *  separately: Svelte coalesces a synchronous burst into a single effect run,
 *  which would hide a cost paid once per notification. */
async function threeUnrelatedUpdates(button: HTMLElement) {
  for (let i = 0; i < 3; i++) {
    await user.click(button)
  }
}

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

  it('does not trigger re-render when selector returns same object reference', async () => {
    const { getByText } = render(TestProxyEquality)
    expect(getByText('Number rendered: 1')).toBeInTheDocument()

    await user.click(getByText('Update ignored'))
    expect(getByText('Number rendered: 1')).toBeInTheDocument()
  })

  it('memoizes an unchanged object slice on every notification', async () => {
    const { getByText } = render(TestSelectorMemoization)
    expect(getByText('Default renders: 1')).toBeInTheDocument()

    await threeUnrelatedUpdates(getByText('Update ignored'))

    // The slice never changed, so a memoizing selector still reads 1 / 1 here.
    // A proxied slice compares unequal to the raw object it wraps, re-sets the
    // slice, and hands out a brand-new Proxy: 4 renders over 4 identities.
    expect(getByText('Default renders: 1')).toBeInTheDocument()
    expect(getByText('Default identities: 1')).toBeInTheDocument()
    // `.current` is the very object the store holds, not a wrapper over it.
    expect(getByText('Same object: true')).toBeInTheDocument()
  })

  it('memoizes the same slice under both controls', async () => {
    const { getByText } = render(TestSelectorMemoization)

    await threeUnrelatedUpdates(getByText('Update ignored'))

    // A compare no proxy can fool, and a primitive slice that is never proxied.
    // Neither arm regresses when the object arm does, which is what isolates
    // the cause to the proxying rather than to the store or the subscription.
    expect(getByText('Keyed renders: 1')).toBeInTheDocument()
    expect(getByText('Primitive renders: 1')).toBeInTheDocument()
  })

  it('compares the slice without tripping a proxy-equality warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const { getByText } = render(TestSelectorMemoization)

      await threeUnrelatedUpdates(getByText('Update ignored'))

      // Svelte warns here only when the operands are one underlying object yet
      // `===` disagrees, so this asserts the compare sees through no wrapper.
      const warned = warn.mock.calls
        .flat()
        .some(
          (arg) =>
            typeof arg === 'string' &&
            arg.includes('state_proxy_equality_mismatch'),
        )
      expect(warned).toBe(false)
    } finally {
      warn.mockRestore()
    }
  })

  it('useSelector reads writable and readonly store state', async () => {
    const { getByText } = render(TestValue)
    expect(getByText('Value: 1')).toBeInTheDocument()
    expect(getByText('Readonly: 2')).toBeInTheDocument()

    await user.click(getByText('Update'))

    await waitFor(() => expect(getByText('Value: 2')).toBeInTheDocument())
    await waitFor(() => expect(getByText('Readonly: 4')).toBeInTheDocument())
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
