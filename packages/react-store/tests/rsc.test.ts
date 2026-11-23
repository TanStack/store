import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const assertions = `
  const atom = store.createAtom(1)
  const counter = store.createStore({ count: 2 })
  store.batch(() => {
    atom.set(3)
    counter.setState(() => ({ count: 4 }))
  })
  assert.equal(atom.get(), 3)
  assert.deepEqual(counter.get(), { count: 4 })

  for (const [name, call] of [
    ['createStoreContext', () => store.createStoreContext()],
    ['useCreateAtom', () => store.useCreateAtom(1)],
    ['useCreateStore', () => store.useCreateStore({ count: 2 })],
    ['useSelector', () => store.useSelector(atom)],
    ['useAtom', () => store.useAtom(atom)],
    ['_useStore', () => store._useStore(counter, (state) => state.count)],
    ['useStore', () => store.useStore(atom)],
  ]) {
    assert.throws(
      call,
      /Attempted to call .* from the server.*on the client/,
      name,
    )
  }
  console.log('server core exports and client boundaries verified')
`

describe('published React Server Component boundaries', () => {
  it.each(['import', 'require'])(
    '%s keeps core exports usable and React APIs client-only',
    (format) => {
      const args = ['--conditions=react-server']
      let entry: string

      if (format === 'import') {
        args.push(
          '--loader=./tests/fixtures/rsc-loader.mjs',
          '--input-type=module',
        )
        entry = `
        import assert from 'node:assert/strict'
        import * as store from '@tanstack/react-store'
      `
      } else {
        entry = `
        const assert = require('node:assert/strict')
        require('react-server-dom-webpack/node-register')()
        const store = require('@tanstack/react-store')
      `
      }

      const output = execFileSync(
        process.execPath,
        [...args, '--eval', entry + assertions],
        {
          cwd: packageDir,
          env: { ...process.env, NODE_ENV: 'development' },
          encoding: 'utf8',
          timeout: 15_000,
        },
      )

      expect(output).toContain(
        'server core exports and client boundaries verified',
      )
    },
  )
})
