import { useSelector } from './useSelector'
import type { Ref } from 'vue-demi'
import type { Atom } from '@tanstack/store'
import type { UseSelectorOptions } from './useSelector'

/**
 * Returns the current atom ref together with a setter.
 *
 * Use this when a component needs to both read and update the same writable
 * atom.
 *
 * @example
 * ```ts
 * const [count, setCount] = useAtom(countAtom)
 *
 * setCount((prev) => prev + 1)
 * console.log(count.value)
 * ```
 */
export function useAtom<TValue>(
  atom: Atom<TValue>,
  options?: UseSelectorOptions<TValue>,
): [Readonly<Ref<TValue>>, Atom<TValue>['set']] {
  const value = useSelector(atom, undefined, options)

  return [value, atom.set]
}
