/**
 * Client (jsdom) tests for <stream-store-provider> mounted client-only (no SSR, no resume).
 * Mounts via Template.mount, same pattern as the package's store-context-tags.test.ts. These
 * close two gaps the SSR+resume suite does not cover directly:
 *   1. client-only single build: when BOTH the render-time const and the onMount run on the same
 *      (client) side, the build-if-absent guard must produce exactly one store, not two.
 *   2. many stores in ONE helper bundle: a single <stream-store-provider> whose value() returns
 *      a bundle of two stores, read independently and written via <store-context>.
 * Distinct keys per test; onDestroy (afterEach) clears the shelf + marker between mounts.
 */
import { afterEach, describe, expect, test } from 'vitest'
import { waitFor } from '@testing-library/dom'
import { createStore } from '../src/index'
import BuildHostTemplate from './fixtures/csr-stream-build-host.marko'
import MultiHostTemplate from './fixtures/csr-stream-multi-host.marko'

const BuildHost = BuildHostTemplate as any
const MultiHost = MultiHostTemplate as any

const instances: Array<{ destroy: () => void }> = []
function mount(T: any, input: Record<string, unknown> = {}) {
  const c = document.createElement('div')
  document.body.appendChild(c)
  instances.push(T.mount(input, c))
  return c
}
afterEach(() => {
  instances.forEach((i) => i.destroy())
  instances.length = 0
  document.body.innerHTML = ''
})
const cell = (el: Element, id: string) =>
  el.querySelector(`[data-testid='${id}']`)?.textContent ?? null

describe('<stream-store-provider> mounted client-only', () => {
  test('builds the store exactly once even though the const and onMount both run on the client', async () => {
    let builds = 0
    const store = createStore({ count: 7 })
    const el = mount(BuildHost, { onBuild: () => { builds += 1 }, store })

    // Seeded from the one built store.
    expect(cell(el, 'count')).toBe('7')
    // Let the onMount fire (it must hit the build-if-absent guard and skip, not rebuild).
    await waitFor(() => expect(cell(el, 'count')).toBe('7'))
    expect(builds).toBe(1)

    // And it is live: a write to that store updates the selector.
    store.setState((s) => ({ count: s.count + 1 }))
    await waitFor(() => expect(cell(el, 'count')).toBe('8'))
    // Still one build after the update — no rebuild on reactive flush.
    expect(builds).toBe(1)
  })
})

describe('<stream-store-provider> with multiple stores in one bundle', () => {
  test('each selector reads its own store, they update independently, and a context write targets one', async () => {
    const a = createStore({ count: 11 })
    const b = createStore({ count: 22 })
    const el = mount(MultiHost, { storeA: a, storeB: b })

    expect(cell(el, 'count-a')).toBe('11')
    expect(cell(el, 'count-b')).toBe('22')

    a.setState(() => ({ count: 12 }))
    await waitFor(() => expect(cell(el, 'count-a')).toBe('12'))
    expect(cell(el, 'count-b')).toBe('22') // b untouched by a

    b.setState(() => ({ count: 23 }))
    await waitFor(() => expect(cell(el, 'count-b')).toBe('23'))
    expect(cell(el, 'count-a')).toBe('12') // a untouched by b

    ;(el.querySelector("[data-testid='write-a']") as HTMLButtonElement).click()
    await waitFor(() => expect(cell(el, 'count-a')).toBe('9'))
    expect(cell(el, 'count-b')).toBe('23') // the <store-context> write hit a only
  })
})
