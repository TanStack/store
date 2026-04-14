import { Component } from '@angular/core'
import { _injectStore, injectSelector, Store } from '@tanstack/angular-store'

// Optionally, you can create stores outside of Angular components at module scope
const petStore = new Store(
  {
    cats: 0,
    dogs: 0,
  },
  ({ setState, get }) =>
    // optionally, define actions for updating your store in specific ways right on the store.
    ({
      addCat: () =>
        setState((prev) => ({
          ...prev,
          cats: prev.cats + 1,
        })),
      addDog: () =>
        setState((prev) => ({
          ...prev,
          dogs: prev.dogs + 1,
        })),
      log: () => console.log(get()),
    }),
)

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main>
      <button type="button" (click)="log()">Log State</button>
      <h1>Angular Store Actions</h1>
      <p>
        This example creates a module-level store with actions. Components read
        state with \`injectSelector\` and call mutations through
        \`store.actions\` or the experimental \`_injectStore\` hook.
      </p>
      <div>
        <p>Cats: {{ cats() }}</p>
        <button type="button" (click)="catActions.addCat()">
          Vote for cats
        </button>
      </div>
      <div>
        <p>Dogs: {{ dogs() }}</p>
        <button type="button" (click)="dogActions.addDog()">
          Vote for dogs
        </button>
      </div>
      <p>Total votes: {{ total() }}</p>
    </main>
  `,
})
export class AppComponent {
  // _injectStore gives both the selected signal and actions in a single tuple
  private catResult = _injectStore(petStore, (state) => state.cats)
  cats = this.catResult[0]
  catActions = this.catResult[1]

  private dogResult = _injectStore(petStore, (state) => state.dogs)
  dogs = this.dogResult[0]
  dogActions = this.dogResult[1]

  total = injectSelector(petStore, (state) => state.cats + state.dogs)

  log() {
    petStore.actions.log()
  }
}
