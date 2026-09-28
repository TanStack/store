import { afterEach, beforeEach, bench, describe } from 'vitest'

export interface Fixture {
  prepare?: () => void
  run: () => number
  verify: (checksum: number) => void
  dispose?: () => void
}

export interface BenchmarkCase {
  name: string
  create: () => Fixture
}

export function registerBenchmark({ name, create }: BenchmarkCase) {
  describe(name, () => {
    let fixture: Fixture | undefined
    let checksum = 0

    const cleanup = () => {
      fixture?.dispose?.()
      fixture = undefined
    }
    const setup = () => {
      cleanup()
      fixture = create()
    }
    const prepare = () => fixture!.prepare?.()
    const verify = () => fixture!.verify(checksum)

    // CodSpeed's simulation runner uses suite hooks for each invocation.
    beforeEach(prepare)
    afterEach(verify)

    bench(
      'run',
      () => {
        checksum = fixture!.run()
      },
      {
        time: 100,
        warmupTime: 50,
        // Vitest's native runner uses Tinybench options instead of suite hooks.
        // Task.opts is Tinybench's public per-iteration hook API. Installing these
        // here keeps preparation/assertions outside every timed invocation.
        setup(task) {
          setup()
          task.opts.beforeEach = prepare
          task.opts.afterEach = verify
        },
        teardown: cleanup,
      },
    )
  })
}
