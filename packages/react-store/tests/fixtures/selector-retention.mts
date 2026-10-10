import assert from 'node:assert/strict'
import { setImmediate as endTurn } from 'node:timers/promises'
// jsdom is a runtime-only test dependency in this workspace.
// @ts-expect-error No declaration package is installed for jsdom.
import { JSDOM } from 'jsdom'
import { createElement, useLayoutEffect } from 'react'
import { createAtom } from '@tanstack/store'
const { useSelector } = (await import(
  new URL('../../src/useSelector.ts', import.meta.url).href
)) as typeof import('../../src/useSelector')

const dom = new JSDOM('<!doctype html><div id="root"></div>')
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
})
const { createRoot } = await import('react-dom/client')
const { flushSync } = await import('react-dom')
type Payload = { payload?: Array<string>; update?: number }
const source = createAtom<{ item: Payload }>({ item: {} })
const previous = new WeakRef<Payload>({
  payload: new Array(100_000).fill('previous'),
})
source.set({ item: previous.deref()! })
const container = document.getElementById('root')
assert.ok(container)
const root = createRoot(container)
let observed: WeakRef<Payload> | undefined

function Component({ field }: { field: 'item' }) {
  const selected = useSelector(source, (state) => state[field])
  useLayoutEffect(() => {
    observed = new WeakRef(selected)
  }, [selected])
  return null
}

async function collect() {
  for (let attempt = 0; attempt < 5; attempt++) {
    await endTurn()
    globalThis.gc!()
  }
}

try {
  flushSync(() => root.render(createElement(Component, { field: 'item' })))
  assert.equal(observed!.deref(), previous.deref())
  await endTurn()
  for (let update = 0; update < 100; update++) {
    flushSync(() => source.set({ item: { update } }))
  }
  await collect()
  assert.equal(observed!.deref()!.update, 99)
  assert.equal(
    previous.deref() === undefined,
    true,
    'The subscription must release the first render selection while mounted',
  )
} finally {
  root.unmount()
  dom.window.close()
}
