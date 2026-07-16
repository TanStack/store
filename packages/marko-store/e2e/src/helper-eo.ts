import { createStore } from '@tanstack/store'
// Characterization aid: records, on the client only, the order of store creation vs the
// selector's first read, plus how many times the store is built. Server render has no window.
export function buildInstrumented(n: number): Record<string, unknown> {
  const w = (globalThis as unknown as { window?: Record<string, unknown> }).window
  const s = createStore({ n }) as unknown as { get: () => unknown; __read?: boolean }
  if (w) {
    const log = (w.__eolog as Array<string> | undefined) ?? []
    w.__eolog = log
    w.__eobuilds = ((w.__eobuilds as number) || 0) + 1
    log.push('build')
    const orig = s.get.bind(s)
    s.get = () => {
      if (!s.__read) {
        s.__read = true
        log.push('read')
      }
      return orig()
    }
  }
  return { counter: s }
}
