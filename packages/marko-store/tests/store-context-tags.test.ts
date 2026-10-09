/**
 * Client (jsdom) tests for the context delivery path: <store-provider> + the
 * <store-selector context=...> picker + <store-context> write handle. Mounts via
 * Template.mount (the Marko 6 DOM API), same as the package's tags.test.ts. Each test
 * passes a FRESH store via input; client mounts never serialize, so that is safe.
 */
import { afterEach, describe, expect, test } from 'vitest'
import { waitFor } from '@testing-library/dom'
import { createStore } from '../src/index'
import SelectorHostTemplate from './fixtures/ctx-selector-host.marko'
import WriteHostTemplate from './fixtures/ctx-write-host.marko'
import NoProviderHostTemplate from './fixtures/ctx-no-provider-host.marko'
import MultiHostTemplate from './fixtures/ctx-multi-host.marko'
import NestedHostTemplate from './fixtures/ctx-nested-host.marko'
import CustomKeyHostTemplate from './fixtures/ctx-customkey-host.marko'
import GetterFedHostTemplate from './fixtures/ctx-getter-fed-host.marko'

const SelectorHost = SelectorHostTemplate as any
const WriteHost = WriteHostTemplate as any
const NoProviderHost = NoProviderHostTemplate as any
const MultiHost = MultiHostTemplate as any
const NestedHost = NestedHostTemplate as any
const CustomKeyHost = CustomKeyHostTemplate as any
const GetterFedHost = GetterFedHostTemplate as any

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

describe('<store-selector context> read path', () => {
  test('seeds from the bundle member with no blank, and reacts to external mutation', async () => {
    const store = createStore({ count: 5 })
    const el = mount(SelectorHost, { store })
    expect(cell(el, 'count')).toBe('5') // seeded at render via the picker — no blank
    store.setState(() => ({ count: 6 }))
    await waitFor(() => expect(cell(el, 'count')).toBe('6')) // live subscription
  })

  test('context-mode with no provider mounts without crashing (empty shelf tolerated)', () => {
    const el = mount(NoProviderHost, {}) // would throw here if the guard were missing
    expect(cell(el, 'count')).toBe('')
  })
})

describe('<store-context> write path', () => {
  test('grabs the bundle in a handler and setState propagates to the selector', async () => {
    const store = createStore({ count: 5 })
    const el = mount(WriteHost, { store })
    expect(cell(el, 'count')).toBe('5')
    ;(el.querySelector("[data-testid='btn']") as HTMLButtonElement).click()
    await waitFor(() => expect(cell(el, 'count')).toBe('99'))
  })
})

describe('<store-selector context> with multiple stores in one provider', () => {
  test('each selector reads its own store, they update independently, and a context write targets one', async () => {
    const a = createStore({ count: 1 })
    const b = createStore({ count: 100 })
    const el = mount(MultiHost, { storeA: a, storeB: b })
    expect(cell(el, 'count-a')).toBe('1')
    expect(cell(el, 'count-b')).toBe('100')

    a.setState(() => ({ count: 2 }))
    await waitFor(() => expect(cell(el, 'count-a')).toBe('2'))
    expect(cell(el, 'count-b')).toBe('100') // b untouched by a's change

    b.setState(() => ({ count: 101 }))
    await waitFor(() => expect(cell(el, 'count-b')).toBe('101'))
    expect(cell(el, 'count-a')).toBe('2') // a untouched by b's change

    ;(el.querySelector("[data-testid='write-a']") as HTMLButtonElement).click()
    await waitFor(() => expect(cell(el, 'count-a')).toBe('9'))
    expect(cell(el, 'count-b')).toBe('101') // the <store-context> write hit a only
  })
})

describe('nested <store-provider> with distinct keys', () => {
  test('an inner provider nests under an outer one; a child reads either bundle by key, independently', async () => {
    const outer = createStore({ count: 1 })
    const inner = createStore({ count: 50 })
    const el = mount(NestedHost, { outer, inner })
    expect(cell(el, 'app')).toBe('1') // outer bundle, key "outer"
    expect(cell(el, 'section')).toBe('50') // inner bundle, key "inner"

    outer.setState(() => ({ count: 2 }))
    await waitFor(() => expect(cell(el, 'app')).toBe('2'))
    expect(cell(el, 'section')).toBe('50') // inner untouched by outer's change

    inner.setState(() => ({ count: 51 }))
    await waitFor(() => expect(cell(el, 'section')).toBe('51'))
    expect(cell(el, 'app')).toBe('2') // outer untouched by inner's change
  })
})

describe('<store-provider> + <store-context> with a custom key', () => {
  test('store-context reads the matching custom-keyed provider, and a write through it propagates', async () => {
    // The provider parks the bundle under key "custom"; the selector reads it back under
    // the same key, and <store-context key="custom"> must grab THAT bundle so a write lands.
    const store = createStore({ count: 5 })
    const el = mount(CustomKeyHost, { store })
    expect(cell(el, 'count')).toBe('5') // selector read the custom-keyed bundle
    ;(el.querySelector("[data-testid='btn']") as HTMLButtonElement).click()
    await waitFor(() => expect(cell(el, 'count')).toBe('77')) // store-context key="custom" found it
  })
})

describe('<store-selector from> fed by <store-context>’s getter', () => {
  test('seeds correctly and stays live in jsdom (the documented first-paint blank is real-browser-only)', async () => {
    // Feeding a from-mode selector from ctx() is the path that shows a one-frame blank on a
    // real browser's FIRST paint (cross-tag timing; server-rendered pages are unaffected). In
    // jsdom the provider parks before the selector seeds, so ctx() already resolves and there
    // is no blank — this test pins that jsdom behavior (correct seed + live updates). The
    // transient blank is environment-specific to a real browser and is not observable here;
    // capturing it would need a real-browser harness able to sample the very first frame.
    const store = createStore({ count: 5 })
    const el = mount(GetterFedHost, { store })
    expect(cell(el, 'count')).toBe('5') // no blank in jsdom
    store.setState(() => ({ count: 6 }))
    await waitFor(() => expect(cell(el, 'count')).toBe('6')) // subscription is live
  })
})
