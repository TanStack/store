import { execFileSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'

const directory = dirname(fileURLToPath(import.meta.url))
const output = process.argv[2]
  ? resolve(process.argv[2])
  : await mkdtemp(join(tmpdir(), 'store-retention-'))
const variants = process.argv.slice(3)
if (!variants.length) {
  variants.push('baseline=HEAD', `production=${process.cwd()}`)
}
for (const [script, args] of [
  ['prepare', variants],
  ['run', []],
  ['count-operations', []],
  ['retention', []],
]) {
  execFileSync(
    process.execPath,
    [join(directory, `${script}.mjs`), output, ...args],
    {
      stdio: 'inherit',
      env: process.env,
    },
  )
}
console.log(`Results: ${output}`)
