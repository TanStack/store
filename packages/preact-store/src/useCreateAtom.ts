import { useState } from 'preact/hooks'
import { createAtom } from '@tanstack/store'
// eslint-disable-next-line no-duplicate-imports
import type { Atom, AtomOptions, ReadonlyAtom } from '@tanstack/store'

/**
 * Creates a stable atom instance for the lifetime of the component.
 *
 * Pass an initial value to create a writable atom, or a getter function to
 * create a readonly derived atom. This mirrors {@link createAtom}, but only
 * creates the atom once per component mount.
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const countAtom = useCreateAtom(0)
 *   const [count, setCount] = useAtom(countAtom)
 *
 *   return (
 *     <button type="button" onClick={() => setCount((prev) => prev + 1)}>
 *       {count}
 *     </button>
 *   )
 * }
 * ```
 */
export function useCreateAtom<T>(
  getValue: (prev?: NoInfer<T>) => T,
  options?: AtomOptions<T>,
): ReadonlyAtom<T>
export function useCreateAtom<T>(
  initialValue: T,
  options?: AtomOptions<T>,
): Atom<T>
export function useCreateAtom<T>(
  valueOrFn: T | ((prev?: T) => T),
  options?: AtomOptions<T>,
): Atom<T> | ReadonlyAtom<T> {
  const [atom] = useState<Atom<T> | ReadonlyAtom<T>>(() => {
    if (typeof valueOrFn === 'function') {
      return createAtom(valueOrFn as (prev?: NoInfer<T>) => T, options)
    }

    return createAtom(valueOrFn, options)
  })

  return atom
}
