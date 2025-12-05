import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateReferenceDocs } from '@tanstack/typedoc-config'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

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
  ],
})

console.log('\n✅ All markdown files have been processed!')

process.exit(0)
