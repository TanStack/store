/* eslint-disable @eslint-react/dom-no-flush-sync -- Time committed production updates synchronously. */
import { createElement, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { afterAll, bench, describe, expect } from 'vitest'
import { createAtom } from '@tanstack/store'
import { useSelector } from '../src/index'

type State = { value: number; ignored: number }
type Mode = 'stable' | 'inline' | 'equal'
const selectValue = (state: State) => state.value
const compareValue = (a: { value: number }, b: { value: number }) =>
  a.value === b.value

function createSource(value: number) {
  const atom = createAtom<State>({ value, ignored: 0 })
  let active = 0
  return {
    source: {
      get: () => atom.get(),
      subscribe(listener: (value: State) => void) {
        const subscription = atom.subscribe(listener)
        active++
        return {
          unsubscribe() {
            subscription.unsubscribe()
            active--
          },
        }
      },
    },
    setValue: (next: number) =>
      atom.set((state) => ({ ...state, value: next })),
    setIgnored: (next: number) =>
      atom.set((state) => ({ ...state, ignored: next })),
    active: () => active,
  }
}

function mount(mode: Mode) {
  const first = createSource(0)
  const second = createSource(10)
  const container = document.createElement('div')
  const root = createRoot(container)
  let observed = 0
  let renders = 0

  function Component({
    source,
    offset,
  }: {
    source: typeof first.source
    offset: number
  }) {
    const selected = useSelector<State, number | { value: number }>(
      source,
      mode === 'stable'
        ? selectValue
        : mode === 'equal'
          ? (state) => ({ value: state.value + offset })
          : (state) => state.value + offset,
      mode === 'equal'
        ? {
            compare: compareValue as (
              a: number | { value: number },
              b: number | { value: number },
            ) => boolean,
          }
        : undefined,
    )
    useLayoutEffect(() => {
      observed = typeof selected === 'number' ? selected : selected.value
      renders++
    })
    return null
  }

  function render(offset = 0, source = first.source) {
    flushSync(() =>
      root.render(
        Array.from({ length: 100 }, (_, key) =>
          createElement(Component, { key, offset, source }),
        ),
      ),
    )
  }
  render()
  return {
    update: (value: number) => flushSync(() => first.setValue(value)),
    ignored: (value: number) => flushSync(() => first.setIgnored(value)),
    render,
    switchSource: (value: number) =>
      render(0, value % 2 ? second.source : first.source),
    read: () => observed,
    renders: () => renders,
    active: () => [first.active(), second.active()],
    unmount: () => root.unmount(),
  }
}

// Validate each workload through rendered values and public subscriptions before
// timing it. An equality fast path must suppress rendering, not skip updates.
for (const mode of ['stable', 'inline', 'equal'] as const) {
  const app = mount(mode)
  expect(app.active()).toEqual([100, 0])
  app.update(1)
  expect(app.read()).toBe(1)
  const renders = app.renders()
  app.ignored(1)
  expect(app.renders()).toBe(renders)
  app.render(5)
  expect(app.read()).toBe(mode === 'stable' ? 1 : 6)
  app.switchSource(1)
  expect(app.read()).toBe(10)
  expect(app.active()).toEqual([0, 100])
  app.unmount()
  expect(app.active()).toEqual([0, 0])
}

describe('useSelector with 100 subscribers', () => {
  const apps: Array<ReturnType<typeof mount>> = []
  afterAll(() => apps.forEach((app) => app.unmount()))

  for (const [name, mode, operation] of [
    ['stable selector updates', 'stable', 'update'],
    ['inline selector updates', 'inline', 'update'],
    ['equal allocating projections', 'equal', 'ignored'],
    ['stable selector parent renders', 'stable', 'render'],
    ['captured prop parent renders', 'inline', 'render'],
    ['source changes and cleanup', 'inline', 'switchSource'],
  ] as const) {
    const app = mount(mode)
    apps.push(app)
    let value = 0
    bench(
      name,
      () => {
        for (let iteration = 0; iteration < 50; iteration++) {
          app[operation](++value)
        }
      },
      { time: 1000, warmupTime: 500, iterations: 100 },
    )
  }

  bench(
    'mount and unmount inline selectors',
    () => {
      for (let iteration = 0; iteration < 10; iteration++) {
        mount('inline').unmount()
      }
    },
    { time: 1000, warmupTime: 500, iterations: 100 },
  )
})
