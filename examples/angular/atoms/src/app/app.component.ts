import { Component } from '@angular/core'
import {
  createAtom,
  injectAtom,
  injectSetValue,
  injectValue,
} from '@tanstack/angular-store'

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
      <p>Total: {{ count() }}</p>
      <div>
        <button type="button" (click)="setCount((prev) => prev + 1)">
          Increment with injectSetValue
        </button>
        <button type="button" (click)="setCount(0)">
          Reset with injectSetValue
        </button>
      </div>
      <div>
        <p>Editable count: {{ editableCount() }}</p>
        <button type="button" (click)="setEditableCount((prev) => prev + 5)">
          Add 5 with injectAtom
        </button>
      </div>
    </main>
  `,
})
export class AppComponent {
  count = injectValue(countAtom)
  setCount = injectSetValue(countAtom)
  private readonly editableAtom = injectAtom(countAtom)
  editableCount = this.editableAtom[0]
  setEditableCount = this.editableAtom[1]
}
