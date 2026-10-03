import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const output = resolve(process.argv[2])
const manifest = JSON.parse(
  await readFile(join(output, 'manifest.json'), 'utf8'),
)
const worker = join(
  dirname(fileURLToPath(import.meta.url)),
  'retention-worker.mjs',
)
const results = []
for (const variant of manifest.variants) {
  for (const [count, mode] of [
    [4000, 'never-observed'],
    [100, 'never-observed'],
    [100, 'unsubscribed'],
    [100, 'handle-discarded'],
  ]) {
    for (let trial = 0; trial < 3; trial++) {
      results.push({
        variant: variant.label,
        trial,
        ...JSON.parse(
          execFileSync(
            process.execPath,
            ['--expose-gc', worker, variant.runtime, mode],
            {
              encoding: 'utf8',
              env: { ...process.env, RETAIN_COUNT: String(count) },
            },
          ),
        ),
      })
    }
  }
}
await writeFile(
  join(output, 'retention-results.json'),
  JSON.stringify({ node: process.version, results }, null, 2),
)
console.log(
  JSON.stringify(
    results.map(({ samples, ...summary }) => summary),
    null,
    2,
  ),
)
