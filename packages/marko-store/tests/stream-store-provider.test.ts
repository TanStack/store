// @vitest-environment node
//
// Server-render guards for <stream-store-provider> -- the streamed born-with-data helper.
// The node environment is deliberate: vitest then uses @marko/vite's HTML (server) transform,
// so Marko's serializer actually runs -- the path where a non-serializable value crashes on
// resume, which the jsdom client-mount tests never touch.
//
// What lives HERE (server-only, no browser needed):
//   - the store is BORN WITH the awaited value on the server (the selection seeds it),
//   - concurrent requests stay isolated when each gets its own $global,
//   - a duplicate key throws at render,
//   - <store-context> above the helper throws at render,
//   - and the KEYSTONE: a store created in the await still rejects if it is held in a block
//     <const>, which is exactly why the helper parks it on $global instead.
//
// What does NOT live here: crossing the awaited value to the browser, no-flash, staying live
// after resume, and effect order. Those need a real browser (jsdom cannot honestly resume a
// streamed page) and are covered by the e2e suite (streaming-helper-*.spec.ts).

import { describe, expect, it } from 'vitest'
import StreamHelper from './fixtures/ssr-stream-helper.marko'
import StreamConstAntipattern from './fixtures/ssr-stream-const-antipattern.marko'
import StreamDup from './fixtures/ssr-stream-dup.marko'
import StreamCtxAbove from './fixtures/ssr-stream-ctx-above.marko'

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

describe('<stream-store-provider> SSR — born with data', () => {
  it('builds the store from the awaited value on the server and seeds the selection', async () => {
    const html = await renderToString(StreamHelper, { value: 77, $global: {} })
    expect(cell(html, 'count')).toBe('77')
  })

  it('renders server-side with no serialization crash (the store lives on $global, not the block)', async () => {
    await expect(
      renderToString(StreamHelper, { value: 77, $global: {} }),
    ).resolves.toBeTypeOf('string')
  })

  it('isolates concurrent requests when each gets its own $global', async () => {
    const [a, b] = await Promise.all([
      renderToString(StreamHelper, { value: 11, $global: {} }),
      renderToString(StreamHelper, { value: 22, $global: {} }),
    ])
    expect(cell(a, 'count')).toBe('11')
    expect(cell(b, 'count')).toBe('22')
  })
})

describe('<stream-store-provider> SSR — keystone guards', () => {
  // The reason the helper parks the store on $global instead of holding it in the block: a store
  // created in the await and kept in a <const> is captured in the block's serialized state, and a
  // live store cannot be serialized. This fixture does exactly that and must still reject.
  it('a store held in a block const inside the await still rejects — why the helper uses the shelf', async () => {
    await expect(
      renderToString(StreamConstAntipattern, { value: 77, $global: {} }),
    ).rejects.toThrow(/serialize/i)
  })

  it('a duplicate key throws at render', async () => {
    await expect(
      renderToString(StreamDup, { a: 111, b: 222, $global: {} }),
    ).rejects.toThrow(/distinct key/i)
  })

  it('<store-context> above the helper throws at render', async () => {
    await expect(
      renderToString(StreamCtxAbove, { value: 88, $global: {} }),
    ).rejects.toThrow(/no bundle on the shelf at render/i)
  })
})
