---
title: Quick Start
id: quick-start
---

The basic angular app example to get started with the Tanstack angular-store.

**app.component.ts**
```html
<h1>How many of your friends like cats or dogs?</h1>
<p>Press one of the buttons to add a counter of how many of your friends like cats or dogs</p>
<app-increment animal="dogs" />
<app-display animal="dogs" />
<app-increment animal="cats" />
<app-display animal="cats" />
```

**store.ts**
```js
import { Store } from '@tanstack/store';

// You can use @tanstack/store outside of App components too!
export const store = new Store({
  dogs: 0,
  cats: 0,
});

export function updateState(animal: 'dogs' | 'cats') {
  store.setState((state) => {
    return {
      ...state,
      [animal]: state[animal] + 1,
    };
  });
}
```

**display.component.ts**
```typescript
import { injectStore } from '@tanstack/angular-store';
import { store } from './store';

@Component({
    selector: 'app-display',
    template: `
        <!-- This will only re-render when animal changes. If an unrelated store property changes, it won't re-render -->
        <div>{{ animal() }}: {{ count() }}</div>
    `,
    standalone: true
})
export class Display {
    animal = input.required<string>();
    count = injectStore(store, (state) => state[this.animal()]);
}
```

**increment.component.ts**
```typescript
import { injectStore } from '@tanstack/angular-store';
import { store, updateState } from './store';

@Component({
    selector: 'app-increment',
    template: `
        <button (click)="updateState(animal())">My Friend Likes {{ animal() }}</button>
    `,
    standalone: true
})
export class Increment {
    animal = input.required<string>();
    updateState = injectStore(store, updateState);
}
```