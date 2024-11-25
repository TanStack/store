import { Component, input } from '@angular/core'
import { updateState } from './store'

@Component({
  selector: 'app-increment',
  template: `
    <button (click)="updateState(animal())">
      My Friend Likes {{ animal() }}
    </button>
  `,
  standalone: true,
})
export class IncrementComponent {
  animal = input.required<'cats' | 'dogs'>()
  updateState = updateState
}
