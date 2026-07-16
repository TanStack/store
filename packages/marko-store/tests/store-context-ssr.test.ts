// @vitest-environment node
//
// Server-render guard for the context path. The node environment runs @marko/vite's
// HTML (server) transform, so Marko's serializer actually executes -- a live store
// reaching the payload would crash here. Mirrors the package's ssr.test.ts.
import { describe, expect, it } from 'vitest'
import SsrHost from './fixtures/ctx-ssr-host.marko'
import MissingProviderHost from './fixtures/ctx-missing-provider-host.marko'
import DupProviderHost from './fixtures/ctx-dup-provider-host.marko'
import { counterStore } from './fixtures/ctx-store'

async function renderToString(t: any, input: Record<string, unknown>): Promise<string> {
  let out = ''
  for await (const c of t.render(input)) out += String(c)
  return out
}
const cell = (html: string, id: string): string | null =>
  html.match(new RegExp(`data-testid=["']?${id}["']?>([^<]*)`))?.[1] ?? null

describe('SSR — <store-provider> + <store-selector context>', () => {
  it('seeds the selected value server-side via the context picker (and does not crash the serializer)', async () => {
    const html = await renderToString(SsrHost as any, {})
    expect(cell(html, 'count')).toBe(String(counterStore.get().count))
  })

  it('<store-context> used without a provider throws at server render', async () => {
    await expect(renderToString(MissingProviderHost as any, {})).rejects.toThrow(
      /store-provider/,
    )
  })

  it('a duplicate <store-provider> for the same key throws at server render', async () => {
    await expect(renderToString(DupProviderHost as any, {})).rejects.toThrow(/Duplicate/)
  })
})
