import { renderToString } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import {
  createAtom,
  createStore,
  createStoreContext,
  useAtom,
  useCreateAtom,
  useCreateStore,
  useSelector,
} from '../src/index'

it('renders every React API during ordinary SSR without subscribing', () => {
  const atom = createAtom(2)
  const store = createStore({ count: 3 })
  const subscribeAtom = vi.spyOn(atom, 'subscribe')
  const subscribeStore = vi.spyOn(store, 'subscribe')
  const { StoreProvider, useStoreContext } = createStoreContext<{
    value: number
  }>()

  function Values() {
    const createdAtom = useCreateAtom(4)
    const createdStore = useCreateStore({ value: 5 })
    const [atomValue] = useAtom(atom)
    const selected = useSelector(store, (state) => state.count)
    const context = useStoreContext()

    return (
      <output>
        {[
          atomValue,
          selected,
          createdAtom.get(),
          createdStore.get().value,
          context.value,
        ].join(',')}
      </output>
    )
  }

  expect(
    renderToString(
      <StoreProvider value={{ value: 7 }}>
        <Values />
      </StoreProvider>,
    ),
  ).toBe('<output>2,3,4,5,7</output>')
  expect(subscribeAtom).not.toHaveBeenCalled()
  expect(subscribeStore).not.toHaveBeenCalled()
})
