import ReactDOM from 'react-dom/client'
import { type Store, useCreateStore, useSelector } from '@tanstack/react-store'

type CounterStore = {
  cats: number
  dogs: number
}

function CountCard({
  label,
  store,
  selector,
}: {
  label: string
  store: Store<CounterStore>
  selector: (state: CounterStore) => number
}) {
  const value = useSelector(store, selector)

  return (
    <p>
      {label}: {value}
    </p>
  )
}

function StoreButtons({ store }: { store: Store<CounterStore> }) {
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          store.setState((prev) => ({
            ...prev,
            cats: prev.cats + 1,
          }))
        }
      >
        Add cat
      </button>
      <button
        type="button"
        onClick={() =>
          store.setState((prev) => ({
            ...prev,
            dogs: prev.dogs + 1,
          }))
        }
      >
        Add dog
      </button>
    </div>
  )
}

function TotalCard({ store }: { store: Store<CounterStore> }) {
  const total = useSelector(store, (state) => state.cats + state.dogs)

  return <p>Total votes: {total}</p>
}

function App() {
  const store = useCreateStore<CounterStore>({
    cats: 0,
    dogs: 0,
  })

  return (
    <main>
      <h1>React Store Hooks</h1>
      <p>
        This example creates a local store and uses useSelector so each view
        reads only the state it needs.
      </p>
      <CountCard label="Cats" store={store} selector={(state) => state.cats} />
      <CountCard label="Dogs" store={store} selector={(state) => state.dogs} />
      <TotalCard store={store} />
      <StoreButtons store={store} />
    </main>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
