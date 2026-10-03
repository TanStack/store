import { execFileSync } from 'node:child_process'
import {
  mkdir,
  mkdtemp,
  writeFile,
  cp,
  access,
  readFile,
  readdir,
  rm,
} from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, join, isAbsolute, relative, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { gzipSync, brotliCompressSync, constants } from 'node:zlib'
import { loadEsbuild } from './esbuild.mjs'

const esbuild = await loadEsbuild()
const output = resolve(
  process.argv[2] || (await mkdtemp(join(tmpdir(), 'store-retention-'))),
)
await mkdir(output, { recursive: true })
const inputs = process.argv.slice(3)
if (!inputs.length)
  throw new Error(
    'Usage: node prepare.mjs OUT baseline=REF pr=REF candidate=/absolute/worktree',
  )
const variants = []
const sizeRows = []
for (const input of inputs) {
  const split = input.indexOf('=')
  const label = input.slice(0, split)
  const rawSource = input.slice(split + 1)
  const isPath = isAbsolute(rawSource) || rawSource.startsWith('.')
  const source = isPath ? resolve(rawSource) : rawSource
  if (!/^[a-zA-Z0-9_-]+$/.test(label)) throw new Error('Invalid label')
  const snapshot = join(output, label)
  await mkdir(snapshot, { recursive: true })
  const copiedPackages = join(snapshot, 'packages')
  if (
    isPath &&
    (source === snapshot ||
      source === copiedPackages ||
      source.startsWith(`${copiedPackages}${sep}`))
  ) {
    throw new Error('A snapshot output cannot replace its own input source')
  }
  // Do not let removed files from an earlier gzip iteration survive in a snapshot.
  await rm(copiedPackages, { recursive: true, force: true })
  if (isPath) {
    const isSrcDir = await access(join(source, 'atom.ts')).then(
      () => true,
      () => false,
    )
    if (isSrcDir) {
      await cp(source, join(snapshot, 'packages/store/src'), {
        recursive: true,
      })
      await cp(
        resolve('packages/react-store/src'),
        join(snapshot, 'packages/react-store/src'),
        { recursive: true },
      )
    } else {
      for (const pkg of ['store', 'react-store'])
        await cp(
          join(source, 'packages', pkg, 'src'),
          join(snapshot, 'packages', pkg, 'src'),
          { recursive: true },
        )
    }
  } else {
    const files = execFileSync(
      'git',
      [
        'ls-tree',
        '-r',
        '--name-only',
        source,
        '--',
        'packages/store/src',
        'packages/react-store/src',
      ],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
    for (const file of files) {
      await mkdir(join(snapshot, file, '..'), { recursive: true })
      await writeFile(
        join(snapshot, file),
        execFileSync('git', ['show', `${source}:${file}`]),
      )
    }
  }
  const index = join(snapshot, 'packages/store/src/index.ts')
  await esbuild.build({
    entryPoints: [index],
    bundle: true,
    minify: true,
    platform: 'node',
    target: 'es2022',
    format: 'esm',
    outfile: join(snapshot, 'runtime.mjs'),
    logLevel: 'silent',
  })
  const entries = {
    createAtom: `export {createAtom} from ${JSON.stringify(index)}`,
    fullStore: `export * from ${JSON.stringify(index)}`,
    reactSelector: `export {createAtom} from ${JSON.stringify(index)}; export {useSelector} from ${JSON.stringify(join(snapshot, 'packages/react-store/src/useSelector.ts'))}`,
    batch: `export {batch} from ${JSON.stringify(index)}`,
    flush: `export {flush} from ${JSON.stringify(index)}`,
    toObserver: `export {toObserver} from ${JSON.stringify(index)}`,
    shallow: `export {shallow} from ${JSON.stringify(index)}`,
  }
  for (const [entry, contents] of Object.entries(entries)) {
    const result = await esbuild.build({
      stdin: {
        contents,
        resolveDir: snapshot,
        sourcefile: `${entry}.ts`,
        loader: 'ts',
      },
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
          name: 'store-snapshot',
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
    sizeRows.push({
      variant: label,
      entry,
      minifiedBytes: bytes.length,
      gzipBytes: gzipSync(bytes, { level: 9 }).length,
      brotliBytes: brotliCompressSync(bytes, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
      }).length,
      // These minified contributions are additive; compressed totals are not.
      moduleBytes: Object.fromEntries(
        Object.entries(Object.values(result.metafile.outputs)[0].inputs)
          .filter(([, input]) => input.bytesInOutput > 0)
          .map(([file, input]) => [
            relative(snapshot, resolve(file)).split(sep).join('/'),
            input.bytesInOutput,
          ]),
      ),
    })
  }
  const hashes = {}
  for (const file of await readdir(join(snapshot, 'packages/store/src'))) {
    const bytes = await readFile(join(snapshot, 'packages/store/src', file))
    hashes[file] = createHash('sha256').update(bytes).digest('hex')
  }
  variants.push({
    label,
    source,
    sourceHashes: hashes,
    artifactHashes: Object.fromEntries(
      await Promise.all(
        ['runtime', ...Object.keys(entries)].map(async (entry) => {
          const file = entry === 'runtime' ? 'runtime.mjs' : `${entry}.min.mjs`
          const bytes = await readFile(join(snapshot, file))
          return [file, createHash('sha256').update(bytes).digest('hex')]
        }),
      ),
    ),
    runtime: join(snapshot, 'runtime.mjs'),
  })
}
const metadata = {
  output,
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  esbuild: esbuild.version,
  target: 'es2022',
  compression: 'gzip level 9; Brotli quality 11',
  variants,
  sizes: sizeRows,
}
await writeFile(
  join(output, 'manifest.json'),
  JSON.stringify(metadata, null, 2),
)
console.log(JSON.stringify(metadata, null, 2))
