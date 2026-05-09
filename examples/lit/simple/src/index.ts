import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {
  TanStackStoreSelector,
  createStore,
} from '@tanstack/lit-store'

// You can instantiate a Store outside of Lit components too!
export const store = createStore({
  dogs: 0,
  cats: 0,
})

type Animal = 'dogs' | 'cats'

const updateState = (animal: Animal) => {
  store.setState((state) => ({
    ...state,
    [animal]: state[animal] + 1,
  }))
}

// This will only re-render when `state[animal]` changes. If an unrelated store
// property changes, it won't re-render.
@customElement('animal-display')
export class AnimalDisplay extends LitElement {
  @property({ type: String }) animal: Animal = 'dogs'

  // Subscribes the host to changes in `state[animal]` only.
  _ = new TanStackStoreSelector(
    this,
    () => store,
    (state) => state[this.animal],
  )

  render() {
    return html`<div>${this.animal}: ${store.state[this.animal]}</div>`
  }
}

@customElement('animal-increment')
export class AnimalIncrement extends LitElement {
  @property({ type: String }) animal: Animal = 'dogs'

  render() {
    return html`
      <button @click=${() => updateState(this.animal)}>
        My Friend Likes ${this.animal}
      </button>
    `
  }
}

@customElement('tanstack-store-demo')
export class TanStackStoreDemo extends LitElement {
  render() {
    return html`
      <div>
        <h1>How many of your friends like cats or dogs?</h1>
        <p>
          Press one of the buttons to add a counter of how many of your friends
          like cats or dogs
        </p>
        <animal-increment animal="dogs"></animal-increment>
        <animal-display animal="dogs"></animal-display>
        <animal-increment animal="cats"></animal-increment>
        <animal-display animal="cats"></animal-display>
      </div>
    `
  }
}
