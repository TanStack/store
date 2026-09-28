import { describe, expect, it } from 'vitest'
import { cases } from './cases'

describe('benchmark workload contracts', () => {
  it('registers unique workload names', () => {
    expect(new Set(cases.map(({ name }) => name)).size).toBe(cases.length)
  })

  it.each(cases)('$name', ({ create }) => {
    const fixture = create()
    try {
      // Exercise both directions of toggles and repeated use of each fixture.
      // The application workload traverses all fields twice per invocation.
      for (let i = 0; i < 4; i++) {
        fixture.prepare?.()
        fixture.verify(fixture.run())
      }
    } finally {
      fixture.dispose?.()
    }
  })
})
