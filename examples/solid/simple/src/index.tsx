import { useStore, Store } from '@tanstack/solid-store'
import { render } from 'solid-js/web'

export const store = new Store({
  cats: 0,
  dogs: 0,
})

interface DisplayProps {
  animals: 'dogs' | 'cats'
}

export const Display = (props: DisplayProps) => {
  const count = useStore(store, (state) => state[props.animals])
  return (
    <span>
      {props.animals}: {count()}
    </span>
  )
}

interface ButtonProps {
  animals: 'dogs' | 'cats'
}

export const Button = (props: ButtonProps) => {
  return (
    <button
      onClick={() => {
        store.setState((state) => {
          return {
            ...state,
            [props.animals]: state[props.animals] + 1,
          }
        })
      }}
    >
      Increment
    </button>
  )
}

const App = () => {
  return (
    <div>
      <h1>How many of your friends like cats or dogs?</h1>
      <p>
        Press one of the buttons to add a counter of how many of your friends
        like cats or dogs
      </p>
      <Button animals="dogs" />
      <Display animals="dogs" />
      <Button animals="cats" />
      <Display animals="cats" />
    </div>
  )
}

const root = document.getElementById('root')

render(() => <App />, root!)
