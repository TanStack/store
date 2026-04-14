import { render } from 'preact'
import { Store, useSelector } from '@tanstack/preact-store'

// Optionally, you can create stores outside of Preact components at module scope
const petStore = new Store({
  cats: 0,
  dogs: 0,
})

function App() {
  // or define stores inside of components with hook variant. You would have to pass store as props or use store context though.
  // const petStore = useCreateStore(...)

  return (
    <main>
      <h1>Preact Store Hooks</h1>
      <p>
        This example creates a module-level store. Components read state with
        `useSelector` and update it directly with `store.setState`.
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
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          petStore.setState((prev) => ({
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
          // directly update values in the store
          petStore.setState((prev) => ({
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

function TotalCard() {
  const total = useSelector(petStore, (state) => state.cats + state.dogs)

  return <p>Total votes: {total}</p>
}

render(<App />, document.getElementById('app')!)
