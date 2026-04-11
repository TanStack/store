import { createContext, createElement, useContext } from 'react'
import type { PropsWithChildren } from 'react'

export function createRequiredContext<TValue>() {
  const Context = createContext<TValue | null>(null)
  Context.displayName = 'StoreContext'

  // eslint-disable-next-line @eslint-react/component-hook-factories
  function Provider({
    children,
    value,
  }: PropsWithChildren<{
    value: TValue
  }>) {
    return createElement(Context.Provider, { value }, children)
  }

  // eslint-disable-next-line @eslint-react/component-hook-factories
  function useRequiredValue() {
    // eslint-disable-next-line @eslint-react/no-use-context
    const value = useContext(Context)

    if (value === null) {
      throw new Error('Missing StoreProvider for StoreContext')
    }

    return value
  }

  return {
    Provider,
    useRequiredValue,
  }
}
