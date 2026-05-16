---
title: Quick Start
id: quick-start
---

The basic Lit app example to get started with TanStack `lit-store`.

You can use `TanStackStoreSelector` in two ways:

- Trigger rerenders when a selected slice changes
- Access the selected value directly through `.value`

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { TanStackStoreSelector, createStore } from '@tanstack/lit-store'

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

@customElement('animal-display')
export class AnimalDisplay extends LitElement {
  @property({ type: String }) animal: Animal = 'dogs'

  // Subscribes only to `state[animal]`
  counter = new TanStackStoreSelector(
    this,
    () => store,
    (state) => state[this.animal],
  )

  render() {
    return html`
      <div>
        <p>
          Using selector.value:
          ${this.counter.value}
        </p>

        <p>
          Reading directly from store.state:
          ${store.state[this.animal]}
        </p>
      </div>
    `
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
          Press one of the buttons to increment how many of your friends
          like cats or dogs.
        </p>

        <animal-increment animal="dogs"></animal-increment>
        <animal-display animal="dogs"></animal-display>

        <animal-increment animal="cats"></animal-increment>
        <animal-display animal="cats"></animal-display>
      </div>
    `
  }
}
```

`selector.value` returns the latest selected value and only updates when
that specific selection changes.

Reading from `store.state` accesses the full store state directly. The
component still rerenders because the selector subscription is active,
but the rendered value itself comes from the store.

Then mount the root element in your HTML:

```html
<tanstack-store-demo></tanstack-store-demo>
<script type="module" src="/src/index.ts"></script>
```
