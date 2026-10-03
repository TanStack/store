import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'

const { createAtom } = await import(process.argv[2])
const validate = process.argv[3] === 'validate'
function computed(counters, getter) {
  return createAtom(
    validate
      ? () => {
          counters.computes++
          return getter()
        }
      : getter,
  )
}
function notify(counters) {
  return validate
    ? () => {
        counters.notifications++
      }
    : () => {}
}
const multiplier = Number(process.env.BENCH_MULTIPLIER || 1)
let sink = 0
function chain(depth, observed = false, coldReadBeforeSubscribe = false) {
  const source = createAtom(0)
  const counters = { computes: 0, notifications: 0 }
  let last = source
  for (let i = 0; i < depth; i++) {
    const upstream = last
    last = computed(counters, () => upstream.get() + 1)
  }
  if (coldReadBeforeSubscribe) assert.equal(last.get(), depth)
  const subscription = observed ? last.subscribe(notify(counters)) : undefined
  assert.equal(last.get(), depth)
  return { source, last, counters, cleanup: () => subscription?.unsubscribe() }
}
const cases = {
  plain_read: [
    1_000_000,
    () => {
      const atom = createAtom(7)
      return {
        run(n) {
          let v = 0
          for (let i = 0; i < n; i++) v += atom.get()
          return v
        },
        check(n, v) {
          assert.equal(v, 7 * n)
        },
      }
    },
  ],
  plain_write: [
    400_000,
    () => {
      const atom = createAtom(0)
      return {
        run(n) {
          for (let i = 1; i <= n; i++) atom.set(i)
          return atom.get()
        },
        check(n, v) {
          assert.equal(v, n)
        },
      }
    },
  ],
  observed_chain8_write: [
    25_000,
    () => {
      const graph = chain(8, true)
      return {
        run(n) {
          for (let i = 1; i <= n; i++) graph.source.set(i)
          return graph.last.get()
        },
        check(n, v) {
          assert.equal(v, n + 8)
          if (validate) assert.equal(graph.counters.notifications, n)
          if (validate) assert.equal(graph.counters.computes, (n + 1) * 8)
        },
        cleanup: graph.cleanup,
        counters: graph.counters,
      }
    },
  ],
  observed_diamond8_write: [
    20_000,
    () => {
      const source = createAtom(0),
        counters = { computes: 0, notifications: 0 }
      const children = Array.from({ length: 8 }, (_, i) =>
        computed(counters, () => source.get() + i),
      )
      const last = computed(counters, () =>
        children.reduce((sum, child) => sum + child.get(), 0),
      )
      const sub = last.subscribe(notify(counters))
      return {
        run(n) {
          for (let i = 1; i <= n; i++) source.set(i)
          return last.get()
        },
        check(n, v) {
          assert.equal(v, n * 8 + 28)
          if (validate) assert.equal(counters.notifications, n)
          if (validate) assert.equal(counters.computes, (n + 1) * 9)
        },
        cleanup: () => sub.unsubscribe(),
        counters,
      }
    },
  ],
  unobserved_chain8_cached_get: [
    500_000,
    () => {
      const graph = chain(8)
      return {
        run(n) {
          let v = 0
          for (let i = 0; i < n; i++) v += graph.last.get()
          return v
        },
        check(n, v) {
          assert.equal(v, n * 8)
          if (validate) assert.equal(graph.counters.computes, 8)
        },
        counters: graph.counters,
      }
    },
  ],
  unrelated_write_chain8_cached_get: [
    100_000,
    () => {
      const graph = chain(8),
        unrelated = createAtom(0)
      return {
        run(n) {
          let v = 0
          for (let i = 1; i <= n; i++) {
            unrelated.set(i)
            v += graph.last.get()
          }
          return v
        },
        check(n, v) {
          assert.equal(v, n * 8)
          if (validate) assert.equal(graph.counters.computes, 8)
        },
        counters: graph.counters,
      }
    },
  ],
  unrelated_write_fanin64_cached_get: [
    25_000,
    () => {
      const sources = Array.from({ length: 64 }, () => createAtom(1)),
        unrelated = createAtom(0),
        counters = { computes: 0 }
      const last = computed(counters, () =>
        sources.reduce((v, atom) => v + atom.get(), 0),
      )
      assert.equal(last.get(), 64)
      return {
        run(n) {
          let v = 0
          for (let i = 1; i <= n; i++) {
            unrelated.set(i)
            v += last.get()
          }
          return v
        },
        check(n, v) {
          assert.equal(v, n * 64)
          if (validate) assert.equal(counters.computes, 1)
        },
        counters,
      }
    },
  ],
  unobserved_chain8_write_read: [
    25_000,
    () => {
      const graph = chain(8)
      return {
        run(n) {
          let v = 0
          for (let i = 1; i <= n; i++) {
            graph.source.set(i)
            v += graph.last.get()
          }
          return v
        },
        check(n, v) {
          assert.equal(v, (n * (n + 1)) / 2 + n * 8)
          if (validate) assert.equal(graph.counters.computes, (n + 1) * 8)
        },
        counters: graph.counters,
      }
    },
  ],
  create_read_discard: [
    25_000,
    () => {
      const counters = { computes: 0 }
      return {
        run(n) {
          let v = 0,
            source
          for (let i = 0; i < n; i++) {
            if (i % 256 === 0) source = createAtom(1)
            const parent = source
            const atom = computed(counters, () => parent.get() + 1)
            v += atom.get()
          }
          return v
        },
        check(n, v) {
          assert.equal(v, n * 2)
          if (validate) assert.equal(counters.computes, n)
        },
        counters,
      }
    },
  ],
  computed_subscribe_unsubscribe: [
    20_000,
    () => {
      const graph = chain(8)
      return {
        run(n) {
          for (let i = 0; i < n; i++)
            graph.last.subscribe(() => {}).unsubscribe()
          return graph.last.get()
        },
        check(n, v) {
          assert.equal(v, 8)
        },
        counters: graph.counters,
      }
    },
  ],
}
cases.observed_chain8_after_cold_read_write = [
  25_000,
  () => {
    const graph = chain(8, true, true)
    return {
      run(n) {
        for (let i = 1; i <= n; i++) graph.source.set(i)
        return graph.last.get()
      },
      check(n, v) {
        assert.equal(v, n + 8)
        if (validate) assert.equal(graph.counters.notifications, n)
        if (validate) assert.equal(graph.counters.computes, (n + 1) * 8)
      },
      cleanup: graph.cleanup,
      counters: graph.counters,
    }
  },
]
for (const depth of [32, 128]) {
  cases[`unobserved_chain${depth}_write_read`] = [
    Math.ceil((25_000 * 8) / depth),
    () => {
      const graph = chain(depth)
      return {
        run(n) {
          let v = 0
          for (let i = 1; i <= n; i++) {
            graph.source.set(i)
            v += graph.last.get()
          }
          return v
        },
        check(n, v) {
          assert.equal(v, (n * (n + 1)) / 2 + n * depth)
          if (validate) assert.equal(graph.counters.computes, (n + 1) * depth)
        },
        counters: graph.counters,
      }
    },
  ]
}
const rows = []
const selectedCases = process.env.BENCH_CASES?.split(',')
for (const [name, [iterations, setup]] of Object.entries(cases)) {
  if (selectedCases && !selectedCases.includes(name)) continue
  const n = Math.ceil(iterations * multiplier)
  // Fresh graph per sample bounds retention and permits exact counters.
  // Warmups use the full workload and are excluded from the result.
  for (let warm = 0; warm < 2; warm++) {
    const test = setup()
    sink += test.run(n)
    test.cleanup?.()
    global.gc?.()
  }
  const test = setup()
  const start = performance.now()
  const result = test.run(n)
  const elapsedMs = performance.now() - start
  sink += result
  test.check(n, result)
  rows.push({
    name,
    iterations: n,
    elapsedMs,
    nsPerIteration: (elapsedMs * 1e6) / n,
    counters: validate ? test.counters : undefined,
  })
  test.cleanup?.()
  global.gc?.()
}
console.log(JSON.stringify({ rows, sink }))
