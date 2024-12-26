/**
 * @private
 */
export type AnyUpdater = (prev: any) => any

/**
 * @private
 */
export interface ListenerValue<T> {
  prevVal: T
  currentVal: T
}

/**
 * @private
 */
export type Listener<T> = (value: ListenerValue<T>) => void
