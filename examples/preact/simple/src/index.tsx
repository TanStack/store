import { render } from 'preact'
import { Store, useSelector } from '@tanstack/preact-store'

// You can instantiate a Store outside of Preact components too!
export const store = new Store({
  dogs: 0,
  cats: 0,
})

interface DisplayProps {
  animal: 'dogs' | 'cats'
}

// This will only re-render when `state[animal]` changes. If an unrelated store property changes, it won't re-render
function Display({ animal }: DisplayProps) {
  const count = useSelector(store, (state) => state[animal]) // formerly, useStore. Now renamed to useSelector.
  return <div>{`${animal}: ${count}`}</div>
}

const updateState = (animal: 'dogs' | 'cats') => {
  store.setState((state) => {
    return {
      ...state,
      [animal]: state[animal] + 1,
    }
  })
}

interface IncrementProps {
  animal: 'dogs' | 'cats'
}

const Increment = ({ animal }: IncrementProps) => (
  <button onClick={() => updateState(animal)}>My Friend Likes {animal}</button>
)

function App() {
  return (
    <div>
      <h1>How many of your friends like cats or dogs?</h1>
      <p>
        Press one of the buttons to add a counter of how many of your friends
        like cats or dogs
      </p>
      <Increment animal="dogs" />
      <Display animal="dogs" />
      <Increment animal="cats" />
      <Display animal="cats" />
    </div>
  )
}

render(<App />, document.getElementById('app')!)
