import { h, defineComponent, watch } from 'vue-demi'
import { render, waitFor } from '@testing-library/vue'
import '@testing-library/jest-dom'
import { Store } from '@tanstack/store'
import { useStore } from '../index'
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()

describe('useStore', () => {
  it('allows us to select state using a selector', async () => {
    const store = new Store({
      select: 0,
      ignored: 1,
    })

    const Comp = defineComponent(() => {
      const storeVal = useStore(store, (state) => state.select)

      return () => <p>Store: {storeVal.value}</p>
    })

    const { getByText } = render(Comp)
    expect(getByText('Store: 0')).toBeInTheDocument()
  })

  it('only triggers a re-render when selector state is updated', async () => {
    const store = new Store({
      select: 0,
      ignored: 1,
    })

    const Comp = defineComponent(() => {
      const storeVal = useStore(store, (state) => state.select)

      const fn = vi.fn()

      return () => {
        fn()
        return (
          <div>
            <p>Number rendered: {fn.mock.calls.length}</p>
            <p>Store: {storeVal.value}</p>
            <button
              onClick={() =>
                store.setState((v) => ({
                  ...v,
                  select: 10,
                }))
              }
            >
              Update select
            </button>
            <button
              onClick={() =>
                store.setState((v) => ({
                  ...v,
                  ignored: 10,
                }))
              }
            >
              Update ignored
            </button>
          </div>
        )
      }
    })

    const { getByText } = render(Comp)
    expect(getByText('Store: 0')).toBeInTheDocument()
    expect(getByText('Number rendered: 1')).toBeInTheDocument()

    await user.click(getByText('Update select'))

    await waitFor(() => expect(getByText('Store: 10')).toBeInTheDocument())
    expect(getByText('Number rendered: 2')).toBeInTheDocument()

    await user.click(getByText('Update ignored'))
    expect(getByText('Number rendered: 2')).toBeInTheDocument()
  })
})
