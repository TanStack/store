import { describe, expect, it } from 'vitest'
import * as core from '@tanstack/store'
import * as binding from '../src'

describe('export surface', () => {
  it('re-exports TanStack Store and the stable Octane adapter APIs', () => {
    const adapterExports = [
      'createStoreContext',
      'useAtom',
      'useCreateAtom',
      'useCreateStore',
      'useSelector',
      'useStore',
    ]
    const expected = [...Object.keys(core), ...adapterExports].sort()

    expect(Object.keys(binding).sort()).toEqual(expected)
    expect(binding).not.toHaveProperty('_useStore')
  })

  it('re-exports the same @tanstack/store module instance', () => {
    expect(binding.createAsyncAtom).toBe(core.createAsyncAtom)
    expect(binding.createAtom).toBe(core.createAtom)
    expect(binding.createStore).toBe(core.createStore)
  })
})
