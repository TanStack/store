import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cpus } from 'node:os'

const output = resolve(process.argv[2])
const rounds = Number(process.env.BENCH_ROUNDS || 7)
const manifest = JSON.parse(
  await readFile(join(output, 'manifest.json'), 'utf8'),
)
const samples = []
const preflight = []
const suite = process.env.BENCH_SUITE || 'retention'
if (!['retention', 'hot'].includes(suite))
  throw new Error('Unknown BENCH_SUITE')
const worker = join(
  dirname(fileURLToPath(import.meta.url)),
  suite === 'hot' ? 'hot-worker.mjs' : 'worker.mjs',
)
for (const variant of manifest.variants) {
  const validation = JSON.parse(
    execFileSync(
      process.execPath,
      ['--expose-gc', worker, variant.runtime, 'validate'],
      { encoding: 'utf8', env: { ...process.env, BENCH_MULTIPLIER: '0.01' } },
    ),
  )
  preflight.push({ variant: variant.label, ...validation })
}
for (let round = 0; round < rounds; round++) {
  // Rotate trial order to spread machine drift; only one worker runs at a time.
  const ordered = manifest.variants.map(
    (_, i) => manifest.variants[(i + round) % manifest.variants.length],
  )
  for (const variant of ordered) {
    const result = JSON.parse(
      execFileSync(process.execPath, ['--expose-gc', worker, variant.runtime], {
        encoding: 'utf8',
        env: process.env,
      }),
    )
    for (const row of result.rows)
      samples.push({ round, variant: variant.label, ...row })
    console.error(`Finished round ${round + 1}/${rounds}: ${variant.label}`)
  }
}
const summaries = []
for (const variant of manifest.variants) {
  for (const name of [...new Set(samples.map((row) => row.name))]) {
    const rows = samples.filter(
      (row) => row.variant === variant.label && row.name === name,
    )
    const sorted = rows.map((row) => row.nsPerIteration).sort((a, b) => a - b)
    summaries.push({
      variant: variant.label,
      name,
      medianNs: sorted[Math.floor(sorted.length / 2)],
      minNs: sorted[0],
      maxNs: sorted.at(-1),
      p25Ns: sorted[Math.floor((sorted.length - 1) * 0.25)],
      p75Ns: sorted[Math.ceil((sorted.length - 1) * 0.75)],
      iterations: rows[0].iterations,
      counters: rows[0].counters,
    })
  }
}
const report = {
  metadata: {
    node: process.version,
    cpu: cpus()[0].model,
    logicalCpus: cpus().length,
    rounds,
    suite,
    selectedCases: process.env.BENCH_CASES?.split(','),
    methodology:
      '2 full warmup workloads before each timed fresh graph; rotated sequential variants in isolated workers; forced GC between workloads; elapsed wall time excludes setup, cleanup, assertions and GC',
  },
  manifest,
  preflight,
  summaries,
  samples,
}
await writeFile(
  join(output, 'runtime-results.json'),
  JSON.stringify(report, null, 2),
)
console.log(JSON.stringify(summaries, null, 2))
