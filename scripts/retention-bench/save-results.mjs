import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises'
import { resolve, join, isAbsolute, relative, sep } from 'node:path'
import { createHash } from 'node:crypto'
const output = resolve(process.argv[2])
const destination = resolve(process.argv[3])
const sourceDestination = process.argv[4]
  ? resolve(process.argv[4])
  : join(destination, 'sources')
await mkdir(destination, { recursive: true })
const manifest = JSON.parse(
  await readFile(join(output, 'manifest.json'), 'utf8'),
)
for (const file of [
  'manifest.json',
  'runtime-results.json',
  'retention-results.json',
  'operation-counts.json',
]) {
  const content = await readFile(join(output, file), 'utf8').catch(
    () => undefined,
  )
  if (!content) continue
  const data = JSON.parse(content)
  const metadata =
    data.manifest || (file === 'manifest.json' ? data : undefined)
  if (metadata) {
    metadata.output = 'recreate-with-prepare.mjs'
    for (const variant of metadata.variants) {
      variant.runtime = `${variant.label}/runtime.mjs`
      if (isAbsolute(variant.source))
        variant.source = relative(
          destination,
          join(sourceDestination, variant.label),
        )
          .split(sep)
          .join('/')
    }
  }
  await writeFile(join(destination, file), JSON.stringify(data, null, 2))
}
for (const variant of manifest.variants.filter((variant) =>
  isAbsolute(variant.source),
)) {
  await cp(
    join(output, variant.label, 'packages/store/src'),
    join(sourceDestination, variant.label),
    { recursive: true },
  )
}
const harnessHashes = {}
for (const name of await readdir(resolve('scripts/retention-bench'))) {
  if (!name.endsWith('.mjs')) continue
  harnessHashes[name] = createHash('sha256')
    .update(await readFile(resolve('scripts/retention-bench', name)))
    .digest('hex')
}
await writeFile(
  join(destination, 'harness-hashes.json'),
  JSON.stringify(harnessHashes, null, 2),
)
console.log(destination)
