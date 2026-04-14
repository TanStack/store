import { useValue } from './useValue'
import type { Accessor } from 'solid-js'
import type { Atom } from '@tanstack/store'
import type { UseSelectorOptions } from './useSelector'

/**
 * Returns the current atom accessor together with a setter.
 *
 * Use this when a component needs to both read and update the same writable
 * atom.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useAtom(countAtom)
 *
 * return (
 *   <button type="button" onClick={() => setCount((prev) => prev + 1)}>
 *     {count()}
 *   </button>
 * )
 * ```
 */
export function useAtom<TValue>(
  atom: Atom<TValue>,
  options?: UseSelectorOptions<TValue>,
): [Accessor<TValue>, Atom<TValue>['set']] {
  const value = useValue(atom, options)

  return [value, atom.set]
}
