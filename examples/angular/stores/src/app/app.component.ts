import { Component } from '@angular/core'
import { injectSelector, Store } from '@tanstack/angular-store'

// Optionally, you can create stores outside of Angular components at module scope
const petStore = new Store({
  cats: 0,
  dogs: 0,
})

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main>
      <h1>Angular Store Hooks</h1>
      <p>
        This example creates a module-level store. Components read state with
        \`injectSelector\` and update it directly with \`store.setState\`.
      </p>
      <p>Cats: {{ cats() }}</p>
      <p>Dogs: {{ dogs() }}</p>
      <p>Total votes: {{ total() }}</p>
      <div>
        <button type="button" (click)="addCat()">Add cat</button>
        <button type="button" (click)="addDog()">Add dog</button>
      </div>
    </main>
  `,
})
export class AppComponent {
  cats = injectSelector(petStore, (state) => state.cats)
  dogs = injectSelector(petStore, (state) => state.dogs)
  total = injectSelector(petStore, (state) => state.cats + state.dogs)

  addCat() {
    petStore.setState((prev) => ({
      ...prev,
      cats: prev.cats + 1,
    }))
  }

  addDog() {
    // directly update values in the store
    petStore.setState((prev) => ({
      ...prev,
      dogs: prev.dogs + 1,
    }))
  }
}
