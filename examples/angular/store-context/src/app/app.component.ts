import { Component, InjectionToken, inject } from '@angular/core'
import {
  createAtom,
  injectAtom,
  injectSelector,
  injectSetValue,
  injectValue,
  Store,
} from '@tanstack/angular-store'
import type { Atom } from '@tanstack/angular-store'

// one drawback of storing stores and atoms in context is you have to define types for the context manually, instead of everything being inferred.

type CounterStore = {
  cats: number
  dogs: number
}

const VOTES_STORE = new InjectionToken<Store<CounterStore>>('votes-store')
const COUNT_ATOM = new InjectionToken<Atom<number>>('count-atom')

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [
    {
      provide: VOTES_STORE,
      useFactory: () =>
        new Store<CounterStore>({
          cats: 0,
          dogs: 0,
        }),
    },
    {
      provide: COUNT_ATOM,
      useFactory: () => createAtom(0),
    },
  ],
  template: `
    <main>
      <h1>Angular Store Context</h1>
      <p>
        This example provides both atoms and stores through Angular DI, then
        consumes them from the same component tree with TanStack Store hooks.
      </p>
      <p>Cats: {{ cats() }}</p>
      <p>Dogs: {{ dogs() }}</p>
      <p>Total votes: {{ total() }}</p>
      <div>
        <button type="button" (click)="addCat()">Add cat</button>
        <button type="button" (click)="addDog()">Add dog</button>
      </div>
      <section>
        <h2>Nested Atom Components</h2>
        <p>Atom count: {{ count() }}</p>
        <div>
          <button type="button" (click)="setCount((prev) => prev + 1)">
            Increment atom
          </button>
          <button type="button" (click)="setCount(0)">Reset atom</button>
        </div>
        <div>
          <p>Editable atom count: {{ editableCount() }}</p>
          <button type="button" (click)="setEditableCount((prev) => prev + 5)">
            Add 5 to atom
          </button>
        </div>
      </section>
    </main>
  `,
})
export class AppComponent {
  votesStore = inject(VOTES_STORE)
  countAtom = inject(COUNT_ATOM)
  private readonly editableAtom = injectAtom(this.countAtom)

  cats = injectSelector(this.votesStore, (state) => state.cats)
  dogs = injectSelector(this.votesStore, (state) => state.dogs)
  total = injectSelector(this.votesStore, (state) => state.cats + state.dogs)
  count = injectValue(this.countAtom)
  setCount = injectSetValue(this.countAtom)
  editableCount = this.editableAtom[0]
  setEditableCount = this.editableAtom[1]

  addCat() {
    this.votesStore.setState((prev) => ({
      ...prev,
      cats: prev.cats + 1,
    }))
  }

  addDog() {
    this.votesStore.setState((prev) => ({
      ...prev,
      dogs: prev.dogs + 1,
    }))
  }
}
