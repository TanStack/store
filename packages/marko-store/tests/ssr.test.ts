// @vitest-environment node
//
// Server-render guard. The node environment is deliberate: vitest then uses
// @marko/vite's HTML (server) transform, so Marko's serializer actually runs --
// the path the jsdom client-mount tests never touch, and where a non-serializable
// value would crash on resume.
//
// The positive cases prove the thunk channel (from={() => store}) survives SSR:
// the tag closes over the registered thunk function, so the store stays inside
// the closure and is never walked by the serializer. The SSR fixtures define the
// thunk INLINE (compiler-registered) over a module-singleton store -- a thunk
// created in this .ts file would itself be an unregistered function and fail to
// serialize.
//
// The keystone guard proves the failure mode the thunk channel exists to avoid:
// a store passed as a bare OBJECT attribute is captured in a resumable closure,
// the attribute value is walked, and serialization rejects.

import { describe, expect, it } from 'vitest'
import SsrSelector from './fixtures/ssr-selector.marko'
import SsrAtom from './fixtures/ssr-atom.marko'
import SsrObjectAntipattern from './fixtures/ssr-object-antipattern.marko'
import SsrPayloadHost from './fixtures/ssr-payload-host.marko'
import { countAtom, counterStore } from './fixtures/ssr-store'

async function renderToString(
  template: any,
  input: Record<string, unknown>,
): Promise<string> {
  let out = ''
  for await (const chunk of template.render(input)) out += String(chunk)
  return out
}

const cell = (html: string, id: string): string | null => {
  const m = html.match(new RegExp(`data-testid=["']?${id}["']?>([^<]*)`))
  return m?.[1] ?? null
}

describe('SSR render — thunk channel', () => {
  it('<store-selector> renders server-side and seeds the selected value', async () => {
    await expect(renderToString(SsrSelector, {})).resolves.toBeTypeOf('string')
    const html = await renderToString(SsrSelector, {})
    expect(cell(html, 'count')).toBe('5')
  })

  it('<store-atom> renders server-side and seeds the value', async () => {
    const html = await renderToString(SsrAtom, {})
    expect(cell(html, 'value')).toBe(String(countAtom.get()))
  })
})

describe('SSR keystone guard — why sources must be thunks', () => {
  it('rejects when a store is passed as a bare object attribute', async () => {
    await expect(
      renderToString(SsrObjectAntipattern, { store: counterStore }),
    ).rejects.toThrow(/serialize/i)
  })
})

describe('SSR serialization boundary — what a resumable payload can carry', () => {
  // The Marko serializer (runtime-tags/src/html/serializer.ts) supports plain
  // objects, arrays, Date, Map, Set, RegExp, typed arrays, URL and more; custom
  // class instances are not serializable and fail loudly in debug builds
  // (production silently drops them — never rely on prod to catch this). The
  // fixture forces serialization by capturing the payload in a resumable closure.
  it('carries strings, nested arrays of objects, Date, Map and Set', async () => {
    const html = await renderToString(SsrPayloadHost, {
      payload: {
        title: 'quarterly report',
        rows: [
          { id: 1, tags: ['a', 'b'] },
          { id: 2, tags: [] },
        ],
        when: new Date('2026-07-14T00:00:00.000Z'),
        tags: new Map([['a', 'alpha']]),
        ids: new Set([1, 2, 3]),
      },
    })
    expect(cell(html, 'title')).toBe('quarterly report')
    expect(cell(html, 'date')).toBe('2026-07-14T00:00:00.000Z')
    expect(cell(html, 'map')).toBe('alpha')
    expect(cell(html, 'set')).toBe('true')
    expect(cell(html, 'rows')).toContain('"id":1')
  })

  it('rejects a custom class instance in the payload', async () => {
    class Cart {
      items: Array<{ id: number }> = []
    }
    await expect(
      renderToString(SsrPayloadHost, {
        payload: { title: 'bad', cart: new Cart() },
      }),
    ).rejects.toThrow(/serialize/i)
  })
})
