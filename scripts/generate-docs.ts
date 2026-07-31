import { resolve } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { generateReferenceDocs } from '@tanstack/typedoc-config'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const octaneReferenceDir = resolve(
  __dirname,
  '../docs/framework/octane/reference',
)

async function replaceOverloadHeadings(
  relativePath: string,
  headings: Array<string>,
) {
  const path = resolve(octaneReferenceDir, relativePath)
  let markdown = await readFile(path, 'utf8')

  for (const heading of headings) {
    markdown = markdown.replace('## Call Signature', `## ${heading}`)
  }

  await writeFile(path, markdown)
}

async function polishOctaneReferenceDocs() {
  await replaceOverloadHeadings('functions/useCreateAtom.md', [
    'Readonly atom',
    'Writable atom',
  ])
  await replaceOverloadHeadings('functions/useCreateStore.md', [
    'Readonly store',
    'Writable store',
    'Store with actions',
  ])

  const useAtomPath = resolve(octaneReferenceDir, 'functions/useAtom.md')
  const useAtom = (await readFile(useAtomPath, 'utf8'))
    .replace(
      'function useAtom<TValue>(atom, options?): [TValue, (fn) => void & (value) => void];',
      [
        'function useAtom<TValue>(',
        '  atom,',
        '  options?,',
        "): [TValue, Atom<TValue>['set']];",
      ].join('\n'),
    )
    .replace(
      '\\[`TValue`, (`fn`) => `void` & (`value`) => `void`\\]',
      '\\[`TValue`, `Atom`\\<`TValue`\\>\\[`"set"`\\]\\]',
    )
  await writeFile(useAtomPath, useAtom)
}

await generateReferenceDocs({
  packages: [
    {
      name: 'store',
      entryPoints: [resolve(__dirname, '../packages/store/src/index.ts')],
      tsconfig: resolve(__dirname, '../packages/store/tsconfig.docs.json'),
      outputDir: resolve(__dirname, '../docs/reference'),
    },
    {
      name: 'angular-store',
      entryPoints: [
        resolve(__dirname, '../packages/angular-store/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/angular-store/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/angular/reference'),
      exclude: ['packages/store/**/*'],
    },
    {
      name: 'react-store',
      entryPoints: [resolve(__dirname, '../packages/react-store/src/index.ts')],
      tsconfig: resolve(
        __dirname,
        '../packages/react-store/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/react/reference'),
      exclude: ['packages/store/**/*'],
    },
    {
      name: 'preact-store',
      entryPoints: [
        resolve(__dirname, '../packages/preact-store/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/preact-store/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/preact/reference'),
      exclude: ['packages/store/**/*'],
    },
    {
      name: 'solid-store',
      entryPoints: [
        resolve(__dirname, '../packages/solid-store/src/index.tsx'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/solid-store/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/solid/reference'),
      exclude: ['packages/store/**/*'],
    },
    {
      name: 'svelte-store',
      entryPoints: [
        resolve(__dirname, '../packages/svelte-store/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/svelte-store/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/svelte/reference'),
      exclude: ['packages/store/**/*'],
    },
    {
      name: 'vue-store',
      entryPoints: [resolve(__dirname, '../packages/vue-store/src/index.ts')],
      tsconfig: resolve(__dirname, '../packages/vue-store/tsconfig.docs.json'),
      outputDir: resolve(__dirname, '../docs/framework/vue/reference'),
      exclude: ['packages/store/**/*'],
    },
    {
      name: 'lit-store',
      entryPoints: [resolve(__dirname, '../packages/lit-store/src/index.ts')],
      tsconfig: resolve(__dirname, '../packages/lit-store/tsconfig.docs.json'),
      outputDir: resolve(__dirname, '../docs/framework/lit/reference'),
      exclude: ['packages/store/**/*'],
    },
    {
      name: 'octane-store',
      entryPoints: [
        resolve(__dirname, '../packages/octane-store/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/octane-store/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/octane/reference'),
      exclude: ['packages/store/**/*'],
    },
  ],
})

await polishOctaneReferenceDocs()

console.log('\n✅ All markdown files have been processed!')

process.exit(0)
