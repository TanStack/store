/**
 * @private
 */
export type AnyUpdater = (...args: Array<any>) => any

/**
 * @private
 */
export type Listener<T> = (props: { prevVal: T; currentVal: T }) => void
