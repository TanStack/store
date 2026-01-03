import { scan } from 'react-scan' // dev-tools for demo
import ReactDOM from 'react-dom/client'
import { createAtom, useStore } from '@tanstack/react-store'

// You can use instantiate a Store outside of React components too!
export const store = createAtom({
  dogs: 0,
  cats: 0,
})

interface DisplayProps {
  animal: 'dogs' | 'cats'
}

// This will only re-render when `state[animal]` changes. If an unrelated store property changes, it won't re-render
const Display = ({ animal }: DisplayProps) => {
  const count = useStore(store, (state) => state[animal])
  return <div>{`${animal}: ${count}`}</div>
}

const updateState = (animal: 'dogs' | 'cats') => {
  store.set((state) => {
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

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

scan()
