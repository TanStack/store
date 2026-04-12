import { render } from 'preact'
import { Store, useSelector, useStoreActions } from '@tanstack/preact-store'

// Optionally, you can create stores outside of Preact components at module scope
const petStore = new Store(
  {
    cats: 0,
    dogs: 0,
  },
  ({ set }) =>
    // optionally, define actions for updating your store in specific ways right on the store.
    ({
      addCat: () =>
        set((prev) => ({
          ...prev,
          cats: prev.cats + 1,
        })),
      addDog: () =>
        set((prev) => ({
          ...prev,
          dogs: prev.dogs + 1,
        })),
    }),
)

function App() {
  // or define stores inside of components with hook variant. You would have to pass store as props or use store context though.
  // const petStore = useCreateStore(...)

  return (
    <main>
      <h1>Preact Store Actions</h1>
      <p>
        This example creates a module-level store with actions. Components read
        state with `useSelector` and call mutations through `useStoreActions`.
      </p>
      <CatsCard />
      <DogsCard />
      <TotalCard />
      <StoreButtons />
    </main>
  )
}

function CatsCard() {
  // read state slice (only re-renders when the selected value changes)
  const value = useSelector(petStore, (state) => state.cats)

  return <p>Cats: {value}</p>
}

function DogsCard() {
  // read state slice (only re-renders when the selected value changes)
  const value = useSelector(petStore, (state) => state.dogs)

  return <p>Dogs: {value}</p>
}

function StoreButtons() {
  // pull stable action functions from the store
  const { addCat, addDog } = useStoreActions(petStore)

  return (
    <div>
      <button type="button" onClick={() => addCat()}>
        Add cat
      </button>
      <button type="button" onClick={() => addDog()}>
        Add dog
      </button>
    </div>
  )
}

function TotalCard() {
  const total = useSelector(petStore, (state) => state.cats + state.dogs)

  return <p>Total votes: {total}</p>
}

render(<App />, document.getElementById('app')!)
