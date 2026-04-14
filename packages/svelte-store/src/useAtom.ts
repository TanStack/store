import { useValue } from './useValue'
import type { Atom } from '@tanstack/store'
import type { UseSelectorOptions } from './useSelector.svelte.js'

/**
 * Returns the current atom holder together with a setter.
 *
 * Use this when a component needs to both read and update the same writable
 * atom.
 *
 * @example
 * ```ts
 * const [count, setCount] = useAtom(countAtom)
 * setCount((prev) => prev + 1)
 * console.log(count.current)
 * ```
 */
export function useAtom<TValue>(
  atom: Atom<TValue>,
  options?: UseSelectorOptions<TValue>,
): [{ readonly current: TValue }, Atom<TValue>['set']] {
  const value = useValue(atom, options)

  return [value, atom.set]
}
