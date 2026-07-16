/**
 * Tag-level integration tests for <store-selector> and <store-atom>.
 *
 * We call template.mount() directly (the Marko 6 DOM API) instead of using
 * @marko/testing-library: its v6 detection (`!template.renderSync`) misfires on
 * Marko 6 browser templates — which DO have renderSync — and takes the Marko
 * 3/4 path, calling a render() that browser templates don't expose. The same
 * workaround is used by @tanstack/marko-virtual. @marko/vite compiles the .marko
 * fixtures to browser templates in jsdom, and waitFor() retries until Marko's
 * rAF-based reactive flush completes.
 *
 * Each test creates a FRESH store/atom and passes it as a thunk (from: () => x).
 * Client mounts never serialize, so a test-created thunk is fine here; the SSR
 * tests (ssr.test.ts) cover the resume/serialization path separately.
 */

import { afterEach, describe, expect, test } from 'vitest'
import { waitFor } from '@testing-library/dom'
import { batch, createAtom, createStore, shallow } from '../src/index'
import { publishStore } from '../src/tags/store-bus'
import SelectorHostTemplate from './fixtures/selector-host.marko'
import RenderCountHostTemplate from './fixtures/selector-render-count-host.marko'
import AtomLateContextHostTemplate from './fixtures/atom-late-context-host.marko'
import AtomHostTemplate from './fixtures/atom-host.marko'
import SourceSwapHostTemplate from './fixtures/selector-source-swap-host.marko'
import SelectorSwapHostTemplate from './fixtures/selector-selector-swap-host.marko'
import NoSelectorHostTemplate from './fixtures/selector-no-selector-host.marko'
import CustomCompareHostTemplate from './fixtures/selector-custom-compare-host.marko'
import NoSelectorSwapHostTemplate from './fixtures/selector-no-selector-swap-host.marko'
import SelectorSwapCompareHostTemplate from './fixtures/selector-swap-compare-host.marko'
import SelectorBothHostTemplate from './fixtures/selector-both-host.marko'

const SelectorHost = SelectorHostTemplate as any
const AtomHost = AtomHostTemplate as any
const SourceSwapHost = SourceSwapHostTemplate as any
const SelectorSwapHost = SelectorSwapHostTemplate as any
const NoSelectorHost = NoSelectorHostTemplate as any
const CustomCompareHost = CustomCompareHostTemplate as any
const NoSelectorSwapHost = NoSelectorSwapHostTemplate as any
const SelectorSwapCompareHost = SelectorSwapCompareHostTemplate as any
const SelectorBothHost = SelectorBothHostTemplate as any
const RenderCountHost = RenderCountHostTemplate as any
const AtomLateContextHost = AtomLateContextHostTemplate as any

const instances: Array<{ destroy: () => void }> = []

function mount(Template: any, input: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  instances.push(Template.mount(input, container))
  return container
}

afterEach(() => {
  instances.forEach((i) => i.destroy())
  instances.length = 0
  document.body.innerHTML = ''
})

const cell = (el: Element, id: string) =>
  el.querySelector(`[data-testid='${id}']`)?.textContent ?? null

describe('<store-selector> read path', () => {
  test('seeds from the store and updates when the selected slice changes', async () => {
    const store = createStore({ count: 5, other: 0 })
    const el = mount(SelectorHost, {
      from: () => store,
      selector: (s: { count: number }) => s.count,
    })
    expect(cell(el, 'value')).toBe('5')

    store.setState((s) => ({ ...s, count: s.count + 1 }))
    await waitFor(() => expect(cell(el, 'value')).toBe('6'))
  })

  test('dedupes when an unrelated field changes', async () => {
    const store = createStore({ count: 5, other: 0 })
    const el = mount(SelectorHost, {
      from: () => store,
      selector: (s: { count: number }) => s.count,
    })
    await waitFor(() => expect(cell(el, 'value')).toBe('5'))

    // The selected slice (count) is unchanged, so the tag must not re-render.
    store.setState((s) => ({ ...s, other: s.other + 99 }))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(cell(el, 'value')).toBe('5')
  })

  test('with no selector, passes the whole snapshot through and updates', async () => {
    const store = createStore({ count: 5, other: 0 })
    const el = mount(NoSelectorHost, { from: () => store })
    expect(cell(el, 'value')).toBe(JSON.stringify({ count: 5, other: 0 }))

    // No selector => identity, so any field change produces a new snapshot and
    // the default === compare sees a different object, so the value updates.
    store.setState((s) => ({ ...s, count: 6 }))
    await waitFor(() =>
      expect(cell(el, 'value')).toBe(JSON.stringify({ count: 6, other: 0 })),
    )
  })

  test('uses a supplied compare to decide whether the value updates', async () => {
    const store = createStore({ count: 0 })
    const el = mount(CustomCompareHost, { from: () => store })
    expect(cell(el, 'value')).toBe('0')

    // Within tolerance (|0 - 1| < 10): the custom compare reports equal, so the
    // tag must not re-render even though the selected slice changed.
    store.setState(() => ({ count: 1 }))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(cell(el, 'value')).toBe('0')

    // Outside tolerance (|0 - 100| >= 10): not equal, so the value updates.
    store.setState(() => ({ count: 100 }))
    await waitFor(() => expect(cell(el, 'value')).toBe('100'))
  })
})

describe('<store-atom> write path', () => {
  test('echoes a write back through valueChange without looping', async () => {
    const atom = createAtom(7)
    const el = mount(AtomHost, { from: () => atom })
    expect(cell(el, 'value')).toBe('7')
    ;(el.querySelector("[data-testid='inc']") as HTMLElement).dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )

    await waitFor(() => expect(cell(el, 'value')).toBe('8'))
    expect(atom.get()).toBe(8)
  })

  test('reflects an external atom mutation, not just local writes', async () => {
    const atom = createAtom(7)
    const el = mount(AtomHost, { from: () => atom })
    expect(cell(el, 'value')).toBe('7')

    // Mutate from outside the tag; the tag's subscription drives the update.
    atom.set(42)
    await waitFor(() => expect(cell(el, 'value')).toBe('42'))
  })

  test('rejects a Store with a clear error at render, not on first write (point 9)', () => {
    // A Store has setState but no set(); <store-atom> writes via set(), so without an
    // early guard it would seed and read fine and only fail on the first valueChange.
    const store = createStore({ count: 1 })
    expect(() => mount(AtomHost, { from: () => store })).toThrow(
      /<store-atom> expects an atom/,
    )
  })
})

describe('<store-selector> onUpdate', () => {
  test('resubscribes and re-seeds when the source store changes', async () => {
    const storeA = createStore({ count: 1, other: 0 })
    const storeB = createStore({ count: 100, other: 0 })
    const el = mount(SourceSwapHost, { storeA, storeB })
    expect(cell(el, 'value')).toBe('1')

    // Swap the source: a new resolved store reaches onUpdate, which unsubscribes
    // from the old one, re-seeds from the new one, and subscribes to it.
    ;(el.querySelector("[data-testid='swap']") as HTMLElement).dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )
    await waitFor(() => expect(cell(el, 'value')).toBe('100'))

    // Updates to the new source now flow through.
    storeB.setState((s) => ({ ...s, count: 101 }))
    await waitFor(() => expect(cell(el, 'value')).toBe('101'))

    // The old source is no longer observed.
    storeA.setState((s) => ({ ...s, count: 999 }))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(cell(el, 'value')).toBe('101')
  })

  test('re-seeds when the selector changes against the same source', async () => {
    const store = createStore({ count: 5, other: 42 })
    const el = mount(SelectorSwapHost, { from: () => store })
    expect(cell(el, 'value')).toBe('5')

    // Swap the selector: same source, so onUpdate re-seeds with the new selection.
    ;(
      el.querySelector("[data-testid='swap-selector']") as HTMLElement
    ).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await waitFor(() => expect(cell(el, 'value')).toBe('42'))

    // The live subscription reflects the new selector on the next change.
    store.setState((s) => ({ ...s, other: 43 }))
    await waitFor(() => expect(cell(el, 'value')).toBe('43'))
  })

  test('with no selector, resubscribes to a swapped source', async () => {
    const storeA = createStore({ count: 1 })
    const storeB = createStore({ count: 100 })
    const el = mount(NoSelectorSwapHost, { storeA, storeB })
    expect(cell(el, 'value')).toBe(JSON.stringify({ count: 1 }))

    // Swap the source with no selector in play: onUpdate takes the resubscribe
    // branch and re-seeds via the identity passthrough.
    ;(el.querySelector("[data-testid='swap']") as HTMLElement).dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )
    await waitFor(() =>
      expect(cell(el, 'value')).toBe(JSON.stringify({ count: 100 })),
    )

    // The new source is now the observed one.
    storeB.setState(() => ({ count: 101 }))
    await waitFor(() =>
      expect(cell(el, 'value')).toBe(JSON.stringify({ count: 101 })),
    )
  })

  test('a selector swap publishes the new slice even when compare calls it equal (point 8)', async () => {
    // a=1 and b=2 are within the host's tolerance compare (|1-2| < 10). A compare-gated
    // swap would treat the new slice as "equal" and keep showing 1; the swap must win.
    const store = createStore({ a: 1, b: 2 })
    const el = mount(SelectorSwapCompareHost, { from: () => store })
    expect(cell(el, 'value')).toBe('1')

    ;(
      el.querySelector("[data-testid='swap-selector']") as HTMLElement
    ).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await waitFor(() => expect(cell(el, 'value')).toBe('2'))
  })
})

describe('<store-selector> input guards', () => {
  test('throws at render when given both `from` and `context`', () => {
    // The two source modes are mutually exclusive; the render-time guard must reject
    // the ambiguous combination rather than silently preferring one.
    const store = createStore({ count: 5 })
    expect(() => mount(SelectorBothHost, { store })).toThrow(
      'takes either `from` or `context`, not both',
    )
  })
})

describe('<store-selector> object/array slices', () => {
  // An object (or array) slice is a FRESH REFERENCE on every store change, so the
  // default `===` compare never reports equal — the classic selector footgun. The
  // first test documents the over-render; the second proves `shallow` (re-exported
  // from the core) is the fix. `track` runs from the consuming interpolation, so
  // its call count IS the consumer re-render count (see the fixture header).
  test('over-renders under the default compare when an unrelated field changes', async () => {
    const store = createStore({ id: 1, name: 'Ada', other: 0 })
    let renders = 0
    const el = mount(RenderCountHost, {
      from: () => store,
      selector: (s: any) => ({ id: s.id, name: s.name }),
      track: (v: any) => {
        renders++
        return JSON.stringify(v)
      },
    })
    expect(cell(el, 'value')).toBe(JSON.stringify({ id: 1, name: 'Ada' }))
    const before = renders

    // The slice's CONTENTS are unchanged, but it's a new object, so `===` sees a
    // change and the consumer re-renders — same text, wasted work.
    store.setState((s) => ({ ...s, other: s.other + 1 }))
    await waitFor(() => expect(renders).toBeGreaterThan(before))
    expect(cell(el, 'value')).toBe(JSON.stringify({ id: 1, name: 'Ada' }))
  })

  test('compare=shallow suppresses the over-render and still passes real changes', async () => {
    const store = createStore({ id: 1, name: 'Ada', other: 0 })
    let renders = 0
    const el = mount(RenderCountHost, {
      from: () => store,
      selector: (s: any) => ({ id: s.id, name: s.name }),
      compare: shallow,
      track: (v: any) => {
        renders++
        return JSON.stringify(v)
      },
    })
    expect(cell(el, 'value')).toBe(JSON.stringify({ id: 1, name: 'Ada' }))
    const before = renders

    // Unrelated change: shallow sees equal contents, no reassignment, no re-render.
    store.setState((s) => ({ ...s, other: s.other + 1 }))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(renders).toBe(before)

    // Real change to the slice: shallow sees a difference and the value updates.
    store.setState((s) => ({ ...s, name: 'Grace' }))
    await waitFor(() =>
      expect(cell(el, 'value')).toBe(JSON.stringify({ id: 1, name: 'Grace' })),
    )
  })
})

describe('write batching', () => {
  // Verified against the core directly: an unbatched double `setState` in one tick
  // notifies subscribers twice; `batch()` collapses it to a single notification
  // carrying the final state. The selector runs once per notification, so its call
  // count observes exactly that at the tag level.
  test('batch() collapses two same-tick writes into one selector update', async () => {
    const store = createStore({ count: 0 })
    let selectorCalls = 0
    const el = mount(SelectorHost, {
      from: () => store,
      selector: (s: any) => {
        selectorCalls++
        return s.count
      },
    })
    expect(cell(el, 'value')).toBe('0')

    const beforeUnbatched = selectorCalls
    store.setState(() => ({ count: 1 }))
    store.setState(() => ({ count: 2 }))
    await waitFor(() => expect(cell(el, 'value')).toBe('2'))
    expect(selectorCalls - beforeUnbatched).toBe(2)

    const beforeBatched = selectorCalls
    batch(() => {
      store.setState(() => ({ count: 3 }))
      store.setState(() => ({ count: 4 }))
    })
    await waitFor(() => expect(cell(el, 'value')).toBe('4'))
    expect(selectorCalls - beforeBatched).toBe(1)
  })
})

describe('<store-atom> late-source recovery', () => {
  // The gap the store-context example exposed under SSR: a getter-fed atom whose
  // source is empty at mount used to crash the resume effect chain and take every
  // other tag on the page down with it. The tag now tolerates the empty beat and
  // attaches via the publish bus when a provider parks — mirroring the selector.
  test('tolerates an empty source at mount and attaches when the bundle is published', async () => {
    const atom = createAtom(7)
    let source: any = null
    const el = mount(AtomLateContextHost, { from: () => source })
    // Empty beat: no crash, blank value.
    expect(cell(el, 'value')).toBe('')

    // The provider parks and rings the bus; the tag attaches and seeds.
    source = atom
    publishStore()
    await waitFor(() => expect(cell(el, 'value')).toBe('7'))

    // Fully live both ways after the late attach.
    atom.set(8)
    await waitFor(() => expect(cell(el, 'value')).toBe('8'))
    ;(el.querySelector("[data-testid='inc']") as HTMLElement).dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )
    await waitFor(() => expect(cell(el, 'value')).toBe('9'))
    expect(atom.get()).toBe(9)
  })
})
