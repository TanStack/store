import { Component } from '@angular/core'
import { DisplayComponent } from './display.component'
import { IncrementComponent } from './increment.component'

@Component({
  selector: 'app-root',
  imports: [DisplayComponent, IncrementComponent],
  template: `
    <h1>How many of your friends like cats or dogs?</h1>
    <p>
      Press one of the buttons to add a counter of how many of your friends like
      cats or dogs
    </p>
    <app-increment animal="dogs" />
    <app-display animal="dogs" />
    <app-increment animal="cats" />
    <app-display animal="cats" />
  `,
})
export class AppComponent {}
