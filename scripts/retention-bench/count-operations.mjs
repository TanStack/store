import { readFile, writeFile, cp } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import assert from 'node:assert/strict'
import { loadEsbuild } from './esbuild.mjs'
const esbuild = await loadEsbuild()
const output = resolve(process.argv[2])
const manifest = JSON.parse(
  await readFile(join(output, 'manifest.json'), 'utf8'),
)
const rows = []
const injections = []
for (const variant of manifest.variants) {
  const sites = {}
  const inject = (
    source,
    pattern,
    replacement,
    name,
    minimum = 1,
    maximum = 1,
  ) => {
    let matches = 0
    const result = source.replace(pattern, (...args) => {
      matches++
      return replacement(...args)
    })
    assert.ok(
      matches >= minimum && matches <= maximum,
      `${variant.label}: expected ${minimum}–${maximum} ${name} injection sites, found ${matches}`,
    )
    sites[name] = matches
    return result
  }
  const root = join(output, variant.label, 'instrumented')
  await cp(join(output, variant.label, 'packages/store/src'), root, {
    recursive: true,
  })
  const alienPath = join(root, 'alien.ts')
  let alien = await readFile(alienPath, 'utf8')
  alien = inject(
    alien,
    /(  function link\([^]*?\): void \{)/,
    (_, header) => `${header}\n    globalThis.retentionBenchCounters.links++`,
    'link',
  )
  alien = inject(
    alien,
    /(  function unlink\([^]*?\): Link \| undefined \{)/,
    (_, header) => `${header}\n    globalThis.retentionBenchCounters.unlinks++`,
    'unlink',
  )
  alien = inject(
    alien,
    /^(\s*)const newLink =/gm,
    (_, indent) =>
      `${indent}globalThis.retentionBenchCounters.allocations++\n${indent}const newLink =`,
    'link allocation',
  )
  // PR-derived variants reconnect retained reverse edges at this assignment.
  // Newly allocated links are counted separately above; warmed trials allocate none.
  alien = alien.replace(
    /(\n    dep\.subsTail = nextDep)/g,
    '\n    globalThis.retentionBenchCounters.reverseReattachments++$1',
  )
  alien = inject(
    alien,
    /^(\s*)if \(nextSub !== undefined\) \{/m,
    (_, indent) =>
      `${indent}globalThis.retentionBenchCounters.reverseDetachments++\n${indent}if (nextSub !== undefined) {`,
    'reverse detachment',
  )
  await writeFile(alienPath, alien)
  const atomPath = join(root, 'atom.ts')
  let atom = await readFile(atomPath, 'utf8')
  atom = inject(
    atom,
    /(    get\(\): T \{|atom.get = function \(\): T \{)/g,
    (_, header) => `${header}\n      globalThis.retentionBenchCounters.gets++`,
    'public get',
    2,
    2,
  )
  atom = inject(
    atom,
    /(    _update\([^]*?\): boolean \{|atom\._update = function \([^]*?\): boolean \{)/g,
    (_, header) =>
      `${header}\n      globalThis.retentionBenchCounters.updates++`,
    'update',
    1,
    2,
  )
  injections.push({ variant: variant.label, sites })
  await writeFile(atomPath, atom)
  const bundle = join(root, 'instrumented.mjs')
  await esbuild.build({
    entryPoints: [join(root, 'index.ts')],
    bundle: true,
    platform: 'node',
    target: 'es2022',
    format: 'esm',
    outfile: bundle,
    logLevel: 'silent',
  })
  globalThis.retentionBenchCounters = freshCounters()
  const { createAtom } = await import(bundle)
  for (const depth of [8, 32, 128]) {
    const source = createAtom(0)
    let last = source
    for (let i = 0; i < depth; i++) {
      const prev = last
      last = createAtom(() => prev.get() + 1)
    }
    assert.equal(last.get(), depth)
    for (let i = 1; i < 4; i++) {
      source.set(i)
      assert.equal(last.get(), i + depth)
    }
    globalThis.retentionBenchCounters = freshCounters()
    source.set(4)
    assert.equal(last.get(), 4 + depth)
    assert.equal(globalThis.retentionBenchCounters.updates, depth + 1)
    rows.push({
      variant: variant.label,
      depth,
      workload: 'one warmed relevant source write + final computed read',
      ...globalThis.retentionBenchCounters,
    })
    const unrelated = createAtom(0)
    globalThis.retentionBenchCounters = freshCounters()
    unrelated.set(1)
    assert.equal(last.get(), 4 + depth)
    assert.equal(globalThis.retentionBenchCounters.updates, 1)
    rows.push({
      variant: variant.label,
      depth,
      workload: 'one unrelated source write + final computed read',
      ...globalThis.retentionBenchCounters,
    })
  }
  const a = createAtom(1)
  const b = createAtom(2)
  const repeated = createAtom(() => {
    let result = 0
    for (let i = 0; i < 1000; i++) result += a.get() + b.get()
    return result
  })
  globalThis.retentionBenchCounters = freshCounters()
  assert.equal(repeated.get(), 3000)
  rows.push({
    variant: variant.label,
    workload: 'initial cold getter alternating a.get() and b.get() 1000 times',
    retainedDependencyRecords: dependencyRecords(repeated),
    ...globalThis.retentionBenchCounters,
  })
  globalThis.retentionBenchCounters = freshCounters()
  a.set(2)
  assert.equal(repeated.get(), 4000)
  rows.push({
    variant: variant.label,
    workload:
      'relevant write + cold getter alternating a.get() and b.get() 1000 times',
    retainedDependencyRecords: dependencyRecords(repeated),
    ...globalThis.retentionBenchCounters,
  })
}
delete globalThis.retentionBenchCounters
await writeFile(
  join(output, 'operation-counts.json'),
  JSON.stringify(
    {
      note: 'Instrumented extracted source only; never used for timing or size',
      injections,
      rows,
    },
    null,
    2,
  ),
)
console.log(JSON.stringify(rows, null, 2))
function freshCounters() {
  return {
    links: 0,
    unlinks: 0,
    allocations: 0,
    gets: 0,
    updates: 0,
    reverseReattachments: 0,
    reverseDetachments: 0,
  }
}
function dependencyRecords(atom) {
  let count = 0
  for (let link = atom.deps; link; link = link.nextDep) count++
  return count
}
