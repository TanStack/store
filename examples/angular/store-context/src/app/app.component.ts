import { Component } from '@angular/core'
import {
  createAtom,
  createStore,
  createStoreContext,
  injectAtom,
  injectSelector,
} from '@tanstack/angular-store'
import type { Atom, Store } from '@tanstack/angular-store'

type CounterStore = {
  cats: number
  dogs: number
}

const { provideStoreContext, injectStoreContext } = createStoreContext<{
  votesStore: Store<CounterStore>
  countAtom: Atom<number>
}>()

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [
    provideStoreContext(() => ({
      votesStore: createStore<CounterStore>({
        cats: 0,
        dogs: 0,
      }),
      countAtom: createAtom(0),
    })),
  ],
  template: `
    <main>
      <h1>Angular Store Context</h1>
      <p>
        This example provides both atoms and stores through Angular DI via
        \`createStoreContext\`, then consumes them from the same component tree
        with TanStack Store hooks.
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
          <button type="button" (click)="count.set((prev) => prev + 1)">
            Increment atom
          </button>
          <button type="button" (click)="count.set(0)">Reset atom</button>
        </div>
      </section>
    </main>
  `,
})
export class AppComponent {
  private ctx = injectStoreContext()

  cats = injectSelector(this.ctx.votesStore, (state) => state.cats)
  dogs = injectSelector(this.ctx.votesStore, (state) => state.dogs)
  total = injectSelector(
    this.ctx.votesStore,
    (state) => state.cats + state.dogs,
  )
  count = injectAtom(this.ctx.countAtom)

  addCat() {
    this.ctx.votesStore.setState((prev) => ({
      ...prev,
      cats: prev.cats + 1,
    }))
  }

  addDog() {
    this.ctx.votesStore.setState((prev) => ({
      ...prev,
      dogs: prev.dogs + 1,
    }))
  }
}
