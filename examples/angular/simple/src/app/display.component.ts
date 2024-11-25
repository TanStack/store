import { injectStore } from '@tanstack/angular-store'
import { Component, input } from '@angular/core'
import { store } from './store'

@Component({
  selector: 'app-display',
  template: `
    <!-- This will only re-render when animal changes. If an unrelated store property changes, it won't re-render -->
    <div>{{ animal() }}: {{ count() }}</div>
  `,
})
export class DisplayComponent {
  animal = input.required<'cats' | 'dogs'>()
  count = injectStore(store, (state) => state[this.animal()])
}
