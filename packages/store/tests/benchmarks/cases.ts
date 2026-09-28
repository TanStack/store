import { strict as assert } from 'node:assert'
import { batch, createAtom, createStore } from '../../src'
import type { BenchmarkCase, Fixture } from './harness'
import type { ReadonlyAtom, Subscription } from '../../src'

function chain(depth: number) {
  const source = createAtom(0)
  let output: ReadonlyAtom<number> = source
  let computations = 0
  for (let i = 0; i < depth; i++) {
    const previous = output
    output = createAtom(() => {
      computations++
      return previous.get() + 1
    })
  }
  return { source, output, computations: () => computations }
}

function observe(output: ReadonlyAtom<number>, count = 1) {
  let notifications = 0
  let checksum = 0
  const subscriptions = Array.from({ length: count }, () =>
    output.subscribe((value) => {
      notifications++
      checksum += value
    }),
  )
  return {
    reset() {
      notifications = 0
      checksum = 0
    },
    checksum: () => checksum,
    verify(expectedCount: number, expectedSum: number) {
      assert.equal(notifications, expectedCount)
      assert.equal(checksum, expectedSum)
    },
    dispose() {
      subscriptions.forEach((subscription) => subscription.unsubscribe())
    },
  }
}

function changedWrites(store: boolean): Fixture {
  const state = store ? createStore(0) : createAtom(0)
  const set =
    'set' in state
      ? (value: number) => state.set(value)
      : (value: number) => state.setState(() => value)
  let next = 0
  return {
    prepare() {
      next = 1 - state.get()
    },
    run() {
      set(next)
      return state.get()
    },
    verify(result) {
      assert.equal(result, next)
    },
  }
}

function observedGraph(
  kind: 'chain' | 'diamond' | 'fan-in',
  size: number,
): Fixture {
  const source = createAtom(0)
  let output: ReadonlyAtom<number>
  let expected: (value: number) => number
  let write = (value: number) => source.set(value)
  let read = () => source.get()
  if (kind === 'chain') {
    const graph = chain(size)
    output = graph.output
    write = (value) => graph.source.set(value)
    read = () => graph.source.get()
    expected = (value) => value + size
  } else if (kind === 'diamond') {
    const left = createAtom(() => source.get() + 1)
    const right = createAtom(() => source.get() + 2)
    output = createAtom(() => left.get() + right.get())
    expected = (value) => 2 * value + 3
  } else {
    const others = Array.from({ length: size - 1 }, () => createAtom(1))
    output = createAtom(
      () => source.get() + others.reduce((sum, atom) => sum + atom.get(), 0),
    )
    expected = (value) => value + size - 1
  }
  const observer = observe(output)
  let next = 0
  return {
    prepare() {
      next = 1 - read()
      observer.reset()
    },
    run() {
      write(next)
      return observer.checksum()
    },
    verify(result) {
      assert.equal(result, expected(next))
      observer.verify(1, expected(next))
      assert.equal(output.get(), expected(next))
    },
    dispose: observer.dispose,
  }
}

function unobserved(
  depth: number,
  state: 'first' | 'cached' | 'dependency' | 'unrelated',
): Fixture {
  let graph = chain(depth)
  const unrelated = createAtom(0)
  let expected = depth
  let computations = 0
  return {
    prepare() {
      if (state === 'first') graph = chain(depth)
      else {
        graph.output.get()
        if (state === 'dependency') graph.source.set(1 - graph.source.get())
        if (state === 'unrelated') unrelated.set(1 - unrelated.get())
      }
      expected = graph.source.get() + depth
      computations = graph.computations()
    },
    run: () => graph.output.get(),
    verify(result) {
      assert.equal(result, expected)
      assert.equal(
        graph.computations() - computations,
        state === 'first' || state === 'dependency' ? depth : 0,
      )
    },
  }
}

function lifecycle(
  operation: 'subscribe' | 'unsubscribe' | 'resubscribe',
): Fixture {
  const graph = chain(10)
  const observer = { count: 0, sum: 0 }
  const onValue = (value: number) => {
    observer.count++
    observer.sum += value
  }
  let subscription: Subscription | undefined
  let computations = 0
  return {
    prepare() {
      subscription?.unsubscribe()
      subscription = undefined
      graph.output.get()
      if (operation !== 'subscribe') {
        subscription = graph.output.subscribe(onValue)
        if (operation === 'resubscribe') {
          subscription.unsubscribe()
          subscription = undefined
          // Reconnect a graph that changed while it had no subscribers.
          graph.source.set(1 - graph.source.get())
        }
      }
      observer.count = 0
      observer.sum = 0
      computations = graph.computations()
    },
    run() {
      if (operation === 'unsubscribe') subscription!.unsubscribe()
      else subscription = graph.output.subscribe(onValue)
      return observer.count
    },
    verify(result) {
      assert.equal(result, 0)
      assert.equal(
        graph.computations() - computations,
        operation === 'resubscribe' ? 10 : 0,
      )
      // Check reconnection before a pull read could repair missing dependencies.
      graph.source.set(1 - graph.source.get())
      assert.equal(observer.count, operation === 'unsubscribe' ? 0 : 1)
      assert.equal(
        observer.sum,
        operation === 'unsubscribe' ? 0 : graph.source.get() + 10,
      )
      assert.equal(graph.output.get(), graph.source.get() + 10)
    },
    dispose() {
      subscription?.unsubscribe()
    },
  }
}

function dynamic(): Fixture {
  const branch = createAtom(false)
  const left = createAtom(10)
  const right = createAtom(20)
  let computations = 0
  const output = createAtom(() => {
    computations++
    return branch.get() ? right.get() : left.get()
  })
  const observer = observe(output)
  let before = 0
  let expected = 0
  return {
    prepare() {
      expected = !branch.get() ? right.get() : left.get()
      observer.reset()
      before = computations
    },
    run() {
      branch.set(!branch.get())
      return observer.checksum()
    },
    verify(result) {
      observer.verify(1, expected)
      assert.equal(result, expected)
      assert.equal(output.get(), expected)
      assert.equal(computations - before, 1)

      // An inactive write is a correctness check of the timed branch switch.
      observer.reset()
      const inactive = branch.get() ? left : right
      inactive.set((value) =>
        value === 10 || value === 20 ? value + 1 : value - 1,
      )
      observer.verify(0, 0)
      assert.equal(output.get(), expected)
      assert.equal(computations - before, 1)
    },
    dispose: observer.dispose,
  }
}

function batching(batched: boolean): Fixture {
  const sources = Array.from({ length: 10 }, () => createAtom(0))
  const output = createAtom(() =>
    sources.reduce((sum, source) => sum + source.get(), 0),
  )
  const observer = observe(output)
  let next = 0
  const write = () => {
    sources.forEach((source) => source.set(next))
  }
  return {
    prepare() {
      next = 1 - sources[0]!.get()
      observer.reset()
    },
    run() {
      if (batched) batch(write)
      else write()
      return observer.checksum()
    },
    verify(result) {
      const expectedSum = batched ? next * 10 : next === 1 ? 55 : 45
      observer.verify(batched ? 1 : 10, expectedSum)
      assert.equal(result, expectedSum)
      assert.equal(output.get(), next * 10)
    },
    dispose: observer.dispose,
  }
}

export const cases: Array<BenchmarkCase> = [
  {
    name: 'basic/atom creation',
    create: () => {
      let created: ReturnType<typeof createAtom<number>>
      return {
        run() {
          created = createAtom(1)
          return 1
        },
        verify(result) {
          assert.equal(result, 1)
          assert.equal(created.get(), 1)
        },
      }
    },
  },
  {
    name: 'basic/atom cached get',
    create: () => {
      const atom = createAtom(1)
      return {
        run: () => atom.get(),
        verify: (result) => assert.equal(result, 1),
      }
    },
  },
  ...[false, true].map((store) => ({
    name: `basic/${store ? 'store' : 'atom'} changed write`,
    create: () => changedWrites(store),
  })),
  {
    name: 'basic/atom same-value write with 100 computed subscribers',
    create: () => {
      const source = createAtom(1)
      let computations = 0
      const output = createAtom(() => {
        computations++
        return source.get() + 1
      })
      const observer = observe(output, 100)
      return {
        prepare() {
          computations = 0
          observer.reset()
        },
        run() {
          source.set(1)
          return observer.checksum()
        },
        verify(result) {
          assert.equal(result, 0)
          observer.verify(0, 0)
          assert.equal(output.get(), 2)
          assert.equal(computations, 0)
        },
        dispose: observer.dispose,
      }
    },
  },
  ...[1, 100].map((count) => ({
    name: `fan-out/${count} subscribers`,
    create: (): Fixture => {
      const source = createAtom(0)
      const observer = observe(source, count)
      let next = 0
      return {
        prepare() {
          next = 1 - source.get()
          observer.reset()
        },
        run() {
          source.set(next)
          return observer.checksum()
        },
        verify(result) {
          assert.equal(result, next * count)
          observer.verify(count, next * count)
        },
        dispose: observer.dispose,
      }
    },
  })),
  {
    name: 'observed/chain depth 100',
    create: () => observedGraph('chain', 100),
  },
  { name: 'observed/diamond', create: () => observedGraph('diamond', 0) },
  {
    name: 'observed/100 sources into one computed',
    create: () => observedGraph('fan-in', 100),
  },
  {
    name: 'observed/unchanged intermediate output',
    create: () => {
      const source = createAtom(0)
      let downstreamRuns = 0
      let parityRuns = 0
      const parity = createAtom(() => {
        parityRuns++
        return source.get() % 2
      })
      const downstream = createAtom(() => {
        downstreamRuns++
        return parity.get() + 1
      })
      const observer = observe(downstream)
      let next = 0
      return {
        prepare() {
          next = 2 - source.get()
          downstreamRuns = 0
          parityRuns = 0
          observer.reset()
        },
        run() {
          source.set(next)
          return observer.checksum()
        },
        verify(result) {
          assert.equal(result, 0)
          observer.verify(0, 0)
          assert.equal(downstream.get(), 1)
          assert.equal(parityRuns, 1)
          assert.equal(downstreamRuns, 0)
        },
        dispose: observer.dispose,
      }
    },
  },
  ...(['first', 'cached', 'dependency', 'unrelated'] as const).map((state) => ({
    name: `unobserved/depth 100/${state} read`,
    create: () => unobserved(100, state),
  })),
  {
    name: 'unobserved/depth 1/dependency read',
    create: () => unobserved(1, 'dependency'),
  },
  {
    name: 'unobserved/depth 100/dependency write',
    create: () => {
      const graph = chain(100)
      let next = 0
      let computations = 0
      return {
        prepare() {
          graph.output.get()
          next = 1 - graph.source.get()
          computations = graph.computations()
        },
        run() {
          graph.source.set(next)
          return next
        },
        verify(result) {
          assert.equal(result, next)
          assert.equal(graph.source.get(), next)
          assert.equal(graph.computations(), computations)
          assert.equal(graph.output.get(), next + 100)
          assert.equal(graph.computations() - computations, 100)
        },
      }
    },
  },
  ...(['subscribe', 'unsubscribe', 'resubscribe'] as const).map(
    (operation) => ({
      name: `lifecycle/${operation} depth 10`,
      create: () => lifecycle(operation),
    }),
  ),
  { name: 'dynamic/switch branches', create: dynamic },
  ...[false, true].map((batched) => ({
    name: `batching/10 sources/${batched ? 'batched' : 'unbatched'}`,
    create: () => batching(batched),
  })),
  {
    name: 'application/100 field selections, 200 single-field updates',
    create: () => {
      const initial = Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => [`field${i}`, 0]),
      )
      const store = createStore(initial)
      const selections = Object.keys(initial).map((key) =>
        createAtom(() => store.get()[key]!),
      )
      // Each invocation changes every field to 1, then back to 0. CodSpeed
      // measures one invocation, so the complete sequence must be inside run.
      const updates = [1, 0].flatMap((value) =>
        Object.keys(initial).map((key) => ({ key, value })),
      )
      const notifiedFields = new Int32Array(updates.length)
      const notifiedValues = new Int32Array(updates.length)
      const notifiedSteps = new Int32Array(updates.length)
      let step = 0
      let notifications = 0
      let checksum = 0
      const subscriptions = selections.map((selection, index) =>
        selection.subscribe((value) => {
          notifiedFields[notifications] = index
          notifiedValues[notifications] = value
          notifiedSteps[notifications] = step
          notifications++
          checksum += (index + 1) * (value + 1)
        }),
      )
      return {
        prepare() {
          notifications = 0
          checksum = 0
          notifiedFields.fill(-1)
          notifiedValues.fill(-1)
          notifiedSteps.fill(-1)
        },
        run() {
          for (step = 0; step < updates.length; step++) {
            const { key, value } = updates[step]!
            store.setState((previous) => ({ ...previous, [key]: value }))
          }
          return checksum
        },
        verify(result) {
          assert.equal(result, 15150) // (1 + ... + 100) * (2 + 1)
          assert.equal(notifications, updates.length)
          updates.forEach(({ value }, i) => {
            assert.equal(notifiedFields[i], i % selections.length)
            assert.equal(notifiedValues[i], value)
            assert.equal(notifiedSteps[i], i)
          })
          selections.forEach((selection, i) => {
            assert.equal(store.get()[`field${i}`], 0)
            assert.equal(selection.get(), 0)
          })
        },
        dispose() {
          subscriptions.forEach((subscription) => subscription.unsubscribe())
        },
      }
    },
  },
]
