import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'

const { createAtom, batch } = await import(process.argv[2])
const validate = process.argv[3] === 'validate'
const multiplier = Number(process.env.BENCH_MULTIPLIER || 1)
let sink = 0
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
function listener(counters, consume) {
  return validate
    ? (value) => {
        counters.notifications++
        consume(value)
      }
    : consume
}
function observedChain(depth, coldFirst = false, expensive = false) {
  const source = createAtom(0)
  const counters = { computes: 0, notifications: 0 }
  let last = source
  for (let i = 0; i < depth; i++) {
    const previous = last
    last = computed(counters, () => {
      const value = previous.get()
      if (!expensive) return value + 1
      // Modest application work: 64 numerical operations for one computed.
      let result = value
      for (let j = 0; j < 64; j++)
        result = (result * 1664525 + 1013904223) >>> 0
      return result
    })
  }
  if (coldFirst) last.get()
  let checksum = 0
  let seen
  const subscription = last.subscribe(
    listener(counters, (value) => {
      checksum += value
      seen = value
    }),
  )
  const initial = last.get()
  return {
    source,
    last,
    counters,
    initial,
    checksum: () => checksum,
    seen: () => seen,
    cleanup: () => subscription.unsubscribe(),
  }
}
function chainWrites(
  depth,
  { coldFirst = false, batched = false, expensive = false } = {},
) {
  const graph = observedChain(depth, coldFirst, expensive)
  return {
    run(n) {
      for (let i = 1; i <= n; i++) {
        if (batched)
          batch(() => {
            graph.source.set(i * 3 - 2)
            graph.source.set(i * 3 - 1)
            graph.source.set(i * 3)
          })
        else graph.source.set(i)
      }
      return graph.last.get()
    },
    check(n, value) {
      if (!expensive) {
        const scale = batched ? 3 : 1
        assert.equal(value, n * scale + depth)
        assert.equal(graph.seen(), value)
        assert.equal(graph.checksum(), (scale * n * (n + 1)) / 2 + depth * n)
      } else {
        let expected = n
        for (let j = 0; j < 64; j++)
          expected = (expected * 1664525 + 1013904223) >>> 0
        assert.equal(value, expected)
        assert.equal(graph.seen(), expected)
      }
      if (validate) {
        assert.equal(graph.counters.computes, (n + 1) * depth)
        assert.equal(graph.counters.notifications, n)
      }
    },
    counters: graph.counters,
    cleanup: graph.cleanup,
  }
}
function churn(writeWhileUnmounted) {
  const source = createAtom(0)
  const counters = { computes: 0, notifications: 0 }
  let last = source
  for (let i = 0; i < 8; i++) {
    const previous = last
    last = computed(counters, () => previous.get() + 1)
  }
  assert.equal(last.get(), 8)
  return {
    run(n) {
      for (let i = 1; i <= n; i++) {
        if (writeWhileUnmounted) source.set(i)
        last.subscribe(listener(counters, () => {})).unsubscribe()
      }
      return last.get()
    },
    check(n, value) {
      assert.equal(value, (writeWhileUnmounted ? n : 0) + 8)
      if (validate) assert.equal(counters.notifications, 0)
      if (validate && writeWhileUnmounted) {
        // The final unmounted snapshot read recomputes one extra chain on main,
        // while detached-version implementations retain the unchanged snapshot.
        assert.ok(counters.computes >= (n + 1) * 8)
        assert.ok(counters.computes <= (n + 2) * 8)
      }
    },
    counters,
  }
}
const cases = {
  plain_mutable_read: [
    10_000_000,
    () => {
      const source = createAtom(7)
      return {
        run(n) {
          let total = 0
          for (let i = 0; i < n; i++) total += source.get()
          return total
        },
        check(n, value) {
          assert.equal(value, n * 7)
        },
      }
    },
  ],
  plain_mutable_write: [
    2_000_000,
    () => {
      const source = createAtom(0)
      return {
        run(n) {
          for (let i = 1; i <= n; i++) source.set(i)
          return source.get()
        },
        check(n, value) {
          assert.equal(value, n)
        },
      }
    },
  ],
  observed_mutable_callback_get: [
    500_000,
    () => {
      const source = createAtom(0),
        counters = { notifications: 0 }
      let total = 0,
        seen = 0
      const subscription = source.subscribe(
        listener(counters, (value) => {
          total += source.get()
          seen = value
        }),
      )
      return {
        run(n) {
          for (let i = 1; i <= n; i++) source.set(i)
          return total
        },
        check(n, value) {
          assert.equal(value, (n * (n + 1)) / 2)
          assert.equal(seen, n)
          if (validate) assert.equal(counters.notifications, n)
        },
        cleanup: () => subscription.unsubscribe(),
        counters,
      }
    },
  ],
  observed_chain1_write: [400_000, () => chainWrites(1)],
  observed_chain8_write: [100_000, () => chainWrites(8)],
  observed_chain32_write: [30_000, () => chainWrites(32)],
  observed_chain8_after_cold_read_write: [
    100_000,
    () => chainWrites(8, { coldFirst: true }),
  ],
  observed_chain8_batched_three_writes: [
    80_000,
    () => chainWrites(8, { batched: true }),
  ],
  observed_expensive_computed1_write: [
    150_000,
    () => chainWrites(1, { expensive: true }),
  ],
  observed_chain8_clean_cached_get: [
    5_000_000,
    () => {
      const graph = observedChain(8)
      return {
        run(n) {
          let total = 0
          for (let i = 0; i < n; i++) total += graph.last.get()
          return total
        },
        check(n, value) {
          assert.equal(value, n * 8)
          if (validate) assert.equal(graph.counters.computes, 8)
        },
        counters: graph.counters,
        cleanup: graph.cleanup,
      }
    },
  ],
  observed_fanout8_write: [
    60_000,
    () => {
      const source = createAtom(0),
        counters = { computes: 0, notifications: 0 }
      let total = 0
      const children = Array.from({ length: 8 }, (_, i) =>
        computed(counters, () => source.get() + i),
      )
      const subscriptions = children.map((child) =>
        child.subscribe(
          listener(counters, (value) => {
            total += value
          }),
        ),
      )
      return {
        run(n) {
          for (let i = 1; i <= n; i++) source.set(i)
          return total
        },
        check(n, value) {
          assert.equal(value, (8 * n * (n + 1)) / 2 + 28 * n)
          if (validate) {
            assert.equal(counters.computes, (n + 1) * 8)
            assert.equal(counters.notifications, n * 8)
          }
        },
        cleanup: () =>
          subscriptions.forEach((subscription) => subscription.unsubscribe()),
        counters,
      }
    },
  ],
  observed_diamond8_write: [
    70_000,
    () => {
      const source = createAtom(0),
        counters = { computes: 0, notifications: 0 }
      const children = Array.from({ length: 8 }, (_, i) =>
        computed(counters, () => source.get() + i),
      )
      const last = computed(counters, () =>
        children.reduce((sum, child) => sum + child.get(), 0),
      )
      let total = 0
      const subscription = last.subscribe(
        listener(counters, (value) => {
          total += value
        }),
      )
      return {
        run(n) {
          for (let i = 1; i <= n; i++) source.set(i)
          return total
        },
        check(n, value) {
          assert.equal(value, (8 * n * (n + 1)) / 2 + 28 * n)
          if (validate) {
            assert.equal(counters.computes, (n + 1) * 9)
            assert.equal(counters.notifications, n)
          }
        },
        cleanup: () => subscription.unsubscribe(),
        counters,
      }
    },
  ],
  observed_equality_suppressed_computed_write: [
    250_000,
    () => {
      const source = createAtom(0),
        counters = { computes: 0, notifications: 0 }
      const last = computed(counters, () => source.get() % 2)
      const subscription = last.subscribe(
        listener(counters, () => {
          throw new Error('Equal selector value must suppress notification')
        }),
      )
      return {
        run(n) {
          for (let i = 1; i <= n; i++) source.set(i * 2)
          return last.get()
        },
        check(n, value) {
          assert.equal(value, 0)
          if (validate) {
            assert.equal(counters.computes, n + 1)
            assert.equal(counters.notifications, 0)
          }
        },
        cleanup: () => subscription.unsubscribe(),
        counters,
      }
    },
  ],
  chain8_churn_unchanged_source: [70_000, () => churn(false)],
  chain8_churn_write_while_unmounted: [60_000, () => churn(true)],
}
const rows = []
const selected = process.env.BENCH_CASES?.split(',')
for (const [name, [iterations, setup]] of Object.entries(cases)) {
  if (selected && !selected.includes(name)) continue
  const n = Math.ceil(iterations * multiplier)
  for (let i = 0; i < 2; i++) {
    const test = setup()
    sink += test.run(n)
    test.cleanup?.()
    global.gc?.()
  }
  const test = setup()
  const start = performance.now()
  const value = test.run(n)
  const elapsedMs = performance.now() - start
  sink += value
  test.check(n, value)
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
