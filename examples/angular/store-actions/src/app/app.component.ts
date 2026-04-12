import { Component } from '@angular/core'
import {
  injectSelector,
  injectStoreActions,
  Store,
} from '@tanstack/angular-store'

// Optionally, you can create stores outside of Angular components at module scope
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

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main>
      <h1>Angular Store Actions</h1>
      <p>
        This example creates a module-level store with actions. Components read
        state with \`injectSelector\` and call mutations through
        \`injectStoreActions\`.
      </p>
      <p>Cats: {{ cats() }}</p>
      <p>Dogs: {{ dogs() }}</p>
      <p>Total votes: {{ total() }}</p>
      <div>
        <button type="button" (click)="actions.addCat()">Add cat</button>
        <button type="button" (click)="actions.addDog()">Add dog</button>
      </div>
    </main>
  `,
})
export class AppComponent {
  cats = injectSelector(petStore, (state) => state.cats)
  dogs = injectSelector(petStore, (state) => state.dogs)
  total = injectSelector(petStore, (state) => state.cats + state.dogs)
  actions = injectStoreActions(petStore)
}
