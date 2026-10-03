import { performance } from 'node:perf_hooks'
import assert from 'node:assert/strict'

const { createAtom } = await import(process.argv[2])
if (!global.gc) throw new Error('Run with --expose-gc')
const count = Number(process.env.RETAIN_COUNT || 4000)
const mode = process.argv[3] || 'never-observed'
function abandon(source) {
  const refs = []
  for (let i = 0; i < count; i++) {
    // Each getter has its own captured payload, as real derived selectors do.
    const captured = new Array(128).fill(i)
    const atom = createAtom(() => source.get() + captured[0])
    assert.equal(atom.get(), i)
    if (mode !== 'never-observed') {
      const subscription = atom.subscribe(() => {})
      if (mode === 'unsubscribed') subscription.unsubscribe()
    }
    refs.push(new WeakRef(atom))
  }
  return refs
}
function reverseLinks(source) {
  let n = 0
  for (let link = source.subs; link; link = link.nextSub) n++
  return n
}
const source = createAtom(0)
const refs = abandon(source)
const linksBeforeGc = reverseLinks(source)
for (let i = 0; i < 8; i++) {
  await new Promise((resolve) => setImmediate(resolve))
  global.gc()
}
let liveAfterGc = 0
for (const ref of refs) if (ref.deref()) liveAfterGc++
const linksAfterGc = reverseLinks(source)
const empty = createAtom(0)
const iterations = mode === 'handle-discarded' ? 200 : 2000
const samples = []
let next = 1
for (let round = 0; round < 7; round++) {
  for (const [label, atom] of round % 2
    ? [
        ['abandoned', source],
        ['empty', empty],
      ]
    : [
        ['empty', empty],
        ['abandoned', source],
      ]) {
    for (let i = 0; i < 100; i++) atom.set(next++)
    const start = performance.now()
    for (let i = 0; i < iterations; i++) atom.set(next++)
    const elapsedMs = performance.now() - start
    assert.equal(atom.get(), next - 1)
    samples.push({
      round,
      label,
      iterations,
      elapsedMs,
      nsPerWrite: (elapsedMs * 1e6) / iterations,
    })
  }
}
const timing = {}
for (const label of ['empty', 'abandoned']) {
  const sorted = samples
    .filter((sample) => sample.label === label)
    .map((sample) => sample.nsPerWrite)
    .sort((a, b) => a - b)
  timing[label] = {
    medianNs: sorted[3],
    minNs: sorted[0],
    maxNs: sorted.at(-1),
  }
}
console.log(
  JSON.stringify({
    count,
    mode,
    liveAfterGc,
    linksBeforeGc,
    linksAfterGc,
    timing,
    samples,
  }),
)
