import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
import { generateReferenceDocs } from '@tanstack/config/typedoc'
import fg from 'fast-glob'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('@tanstack/config/typedoc').Package[]} */
const packages = [
  {
    name: 'store',
    entryPoints: [resolve(__dirname, '../packages/store/src/index.ts')],
    tsconfig: resolve(__dirname, '../packages/store/tsconfig.docs.json'),
    outputDir: resolve(__dirname, '../docs/reference'),
  },
  {
    name: 'angular-store',
    entryPoints: [resolve(__dirname, '../packages/angular-store/src/index.ts')],
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
    tsconfig: resolve(__dirname, '../packages/react-store/tsconfig.docs.json'),
    outputDir: resolve(__dirname, '../docs/framework/react/reference'),
    exclude: ['packages/store/**/*'],
  },
  {
    name: 'solid-store',
    entryPoints: [resolve(__dirname, '../packages/solid-store/src/index.tsx')],
    tsconfig: resolve(__dirname, '../packages/solid-store/tsconfig.docs.json'),
    outputDir: resolve(__dirname, '../docs/framework/solid/reference'),
    exclude: ['packages/store/**/*'],
  },
  {
    name: 'svelte-store',
    entryPoints: [resolve(__dirname, '../packages/svelte-store/src/index.ts')],
    tsconfig: resolve(__dirname, '../packages/svelte-store/tsconfig.docs.json'),
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
]

await generateReferenceDocs({ packages })

// Find all markdown files matching the pattern
const markdownFiles = [
  ...(await fg('docs/reference/**/*.md')),
  ...(await fg('docs/framework/*/reference/**/*.md')),
]

console.log(`Found ${markdownFiles.length} markdown files to process\n`)

// Process each markdown file
markdownFiles.forEach((file) => {
  const content = readFileSync(file, 'utf-8')
  let updatedContent = content
  updatedContent = updatedContent.replaceAll(/\]\(\.\.\//gm, '](../../')
  // updatedContent = content.replaceAll(/\]\(\.\//gm, '](../')
  updatedContent = updatedContent.replaceAll(
    /\]\((?!https?:\/\/|\/\/|\/|\.\/|\.\.\/|#)([^)]+)\)/gm,
    (match, p1) => `](../${p1})`,
  )

  // Write the updated content back to the file
  if (updatedContent !== content) {
    writeFileSync(file, updatedContent, 'utf-8')
    console.log(`Processed file: ${file}`)
  }
})

console.log('\n✅ All markdown files have been processed!')

process.exit(0)
