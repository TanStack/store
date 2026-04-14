import { Component } from '@angular/core'
import { createAtom, injectAtom } from '@tanstack/angular-store'

// Optionally, you can create atoms outside of Angular components at module scope
const countAtom = createAtom(0)

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main>
      <h1>Angular Atom Hooks</h1>
      <p>
        This example creates a module-level atom and reads and updates it with
        the Angular hooks.
      </p>
      <p>Count: {{ count() }}</p>
      <div>
        <button type="button" (click)="count.set((prev) => prev + 1)">
          Increment
        </button>
        <button type="button" (click)="count.set(0)">Reset</button>
      </div>
      <div>
        <button type="button" (click)="count.set((prev) => prev + 5)">
          Add 5
        </button>
      </div>
    </main>
  `,
})
export class AppComponent {
  count = injectAtom(countAtom)
}
