import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { gzipSync, brotliCompressSync, constants } from 'node:zlib'
import { loadEsbuild } from './esbuild.mjs'

const esbuild = await loadEsbuild()
const output = resolve(process.argv[2])
const variants = []
const sizes = []
await mkdir(output, { recursive: true })
for (const input of process.argv.slice(3)) {
  const split = input.indexOf('=')
  const label = input.slice(0, split)
  const source = resolve(input.slice(split + 1))
  if (!/^[a-zA-Z0-9_-]+$/.test(label)) throw new Error('Invalid label')
  const snapshot = join(output, label)
  const core = join(snapshot, 'core')
  await cp(dirname(source), core, { recursive: true })
  const index = join(core, basename(source))
  const react = join(snapshot, 'react')
  await cp(resolve('packages/react-store/dist'), react, { recursive: true })
  const entries = Object.fromEntries(
    ['createAtom', 'batch', 'flush', 'toObserver', 'shallow'].map((name) => [
      name,
      `export {${name}} from ${JSON.stringify(index)}`,
    ]),
  )
  entries.fullStore = `export * from ${JSON.stringify(index)}`
  entries.reactSelector = `export {createAtom} from ${JSON.stringify(index)}; export {useSelector} from ${JSON.stringify(join(react, 'index.js'))}`
  const artifactHashes = {}
  for (const [entry, contents] of Object.entries(entries)) {
    const result = await esbuild.build({
      stdin: { contents, resolveDir: snapshot, sourcefile: `${entry}.js` },
      bundle: true,
      minify: true,
      treeShaking: true,
      platform: 'browser',
      target: 'es2022',
      format: 'esm',
      write: false,
      metafile: true,
      external: ['react', 'use-sync-external-store/shim/with-selector'],
      plugins: [
        {
          name: 'built-store',
          setup(build) {
            build.onResolve({ filter: /^@tanstack\/store$/ }, () => ({
              path: index,
            }))
          },
        },
      ],
      logLevel: 'silent',
    })
    const bytes = result.outputFiles[0].contents
    await writeFile(join(snapshot, `${entry}.min.mjs`), bytes)
    artifactHashes[entry] = createHash('sha256').update(bytes).digest('hex')
    sizes.push({
      variant: label,
      entry,
      minifiedBytes: bytes.length,
      gzipBytes: gzipSync(bytes, { level: 9 }).length,
      brotliBytes: brotliCompressSync(bytes, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
      }).length,
      moduleBytes: Object.fromEntries(
        Object.entries(Object.values(result.metafile.outputs)[0].inputs)
          .filter(([, row]) => row.bytesInOutput > 0)
          .map(([file, row]) => [
            relative(snapshot, resolve(file)),
            row.bytesInOutput,
          ]),
      ),
    })
  }
  const builtFileHashes = {}
  for (const file of await readdir(core)) {
    if (!file.endsWith('.js')) continue
    builtFileHashes[file] = createHash('sha256')
      .update(await readFile(join(core, file)))
      .digest('hex')
  }
  variants.push({ label, source, builtFileHashes, artifactHashes })
}
const report = {
  node: process.version,
  esbuild: esbuild.version,
  tsdown: JSON.parse(
    await readFile(resolve('node_modules/tsdown/package.json'), 'utf8'),
  ).version,
  target: 'es2022',
  note: 'Actual tsdown ESM package output, then identical minified consumer options. React adapter also imports built dist/index.js. Compression totals are non-additive.',
  variants,
  sizes,
}
await writeFile(
  join(output, 'dist-size-results.json'),
  JSON.stringify(report, null, 2),
)
console.log(JSON.stringify(sizes, null, 2))
