import { describe, expect, test } from 'vitest'
import {
  Component,
  computed,
  effect,
  input,
  OnInit,
  signal,
  untracked,
  inputBinding,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { createStore } from '@tanstack/store'
import { injectStore } from '../src/index'

function createStableSignal<T>(fn: () => T): () => T {
  return computed(() => untracked(fn))
}

const selectorReadsInputStore = createStore({ cats: 2, dogs: 4 })

describe('injectStore', () => {
  test(`allows us to select state using a selector`, () => {
    const store = createStore({ select: 0, ignored: 1 })

    @Component({
      template: `<p>Store: {{ storeVal() }}</p>`,
      standalone: true,
    })
    class MyCmp {
      storeVal = injectStore(store, (state) => state.select)
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    const element = fixture.nativeElement
    expect(element.textContent).toContain('Store: 0')
  })

  test('only triggers a re-render when selector state is updated', () => {
    const store = createStore({ select: 0, ignored: 1 })
    let count = 0

    @Component({
      template: `
        <div>
          <p>Store: {{ storeVal() }}</p>
          <button id="updateSelect" (click)="updateSelect()">
            Update select
          </button>
          <button id="updateIgnored" (click)="updateIgnored()">
            Update ignored
          </button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      storeVal = injectStore(store, (state) => state.select)

      constructor() {
        effect(() => {
          console.log(this.storeVal())
          count++
        })
      }

      updateSelect() {
        store.setState((v) => ({
          ...v,
          select: 10,
        }))
      }

      updateIgnored() {
        store.setState((v) => ({
          ...v,
          ignored: 10,
        }))
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    const element = fixture.nativeElement
    const debugElement = fixture.debugElement

    expect(element.textContent).toContain('Store: 0')
    expect(count).toEqual(1)

    debugElement
      .query(By.css('button#updateSelect'))
      .triggerEventHandler('click', null)

    fixture.detectChanges()
    expect(element.textContent).toContain('Store: 10')
    expect(count).toEqual(2)

    debugElement
      .query(By.css('button#updateIgnored'))
      .triggerEventHandler('click', null)

    fixture.detectChanges()
    expect(element.textContent).toContain('Store: 10')
    expect(count).toEqual(2)
  })

  test('supports a store created inside a stable signal', () => {
    const count = signal(1)

    const storeVal = TestBed.runInInjectionContext(() => {
      const store = createStableSignal(() => createStore({ value: count() }))
      const storeVal = injectStore(() => store(), (state) => state.value)

      effect(() => {
        store().setState(() => ({ value: count() }))
      })

      return storeVal
    })

    expect(storeVal()).toBe(1)

    count.set(5)
    TestBed.tick()

    expect(storeVal()).toBe(5)
  })

  test('supports a store created from input signals', () => {
    @Component({
      template: `<p id="displayStoreVal">{{ storeVal() }}</p>`,
      standalone: true,
    })
    class StoreFromInputChildCmp {
      value = input.required<number>()
      store = createStableSignal(() =>
        createStore({ doubled: this.value() * 2 }),
      )
      storeVal = injectStore(() => this.store(), (state) => state.doubled)

      constructor() {
        effect(() => {
          this.store().setState(() => ({ doubled: this.value() * 2 }))
        })
      }
    }

    const value = signal(3)
    const fixture = TestBed.createComponent(StoreFromInputChildCmp, {
      bindings: [inputBinding('value', value)],
    })
    fixture.detectChanges()

    const debugElement = fixture.debugElement

    expect(
      debugElement.query(By.css('p#displayStoreVal')).nativeElement.textContent,
    ).toContain('6')

    value.set(4)
    fixture.detectChanges()

    expect(
      debugElement.query(By.css('p#displayStoreVal')).nativeElement.textContent,
    ).toContain('8')
  })

  test('supports selectors that read input signals', () => {
    @Component({
      selector: 'app-selector-reads-input',
      template: `<p id="displayStoreVal">{{ count() }}</p>`,
      standalone: true,
    })
    class SelectorReadsInputChildCmp {
      animal = input.required<'cats' | 'dogs'>()
      count = injectStore(
        selectorReadsInputStore,
        (state) => state[this.animal()],
      )
    }

    const animal = signal<'cats' | 'dogs'>('cats')
    const fixture = TestBed.createComponent(SelectorReadsInputChildCmp, {
      bindings: [inputBinding('animal', animal)],
    })
    fixture.detectChanges()

    const debugElement = fixture.debugElement

    expect(
      debugElement.query(By.css('p#displayStoreVal')).nativeElement.textContent,
    ).toContain('2')

    animal.set('dogs')
    fixture.detectChanges()

    expect(
      debugElement.query(By.css('p#displayStoreVal')).nativeElement.textContent,
    ).toContain('4')
  })

  test('makes the selected store value available on ngOnInit', () => {
    let didAssertOnInit = false

    @Component({
      template: ``,
      standalone: true,
    })
    class StoreFromInputOnInitCmp implements OnInit {
      value = input.required<number>()
      store = createStableSignal(() =>
        createStore({ doubled: this.value() * 2 }),
      )
      storeVal = injectStore(() => this.store(), (state) => state.doubled)

      constructor() {
        effect(() => {
          this.store().setState(() => ({ doubled: this.value() * 2 }))
        })
      }

      ngOnInit() {
        expect(this.storeVal()).toBe(14)
        didAssertOnInit = true
      }
    }

    const value = signal(7)
    const fixture = TestBed.createComponent(StoreFromInputOnInitCmp, {
      bindings: [inputBinding('value', value)],
    })
    fixture.detectChanges()
    expect(didAssertOnInit).toBe(true)
  })
})

describe('dataType', () => {
  test('date change trigger re-render', () => {
    const store = createStore({ date: new Date('2025-03-29T21:06:30.401Z') })

    @Component({
      template: `
        <div>
          <p id="displayStoreVal">{{ storeVal() }}</p>
          <button id="updateDate" (click)="updateDate()">Update date</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      storeVal = injectStore(store, (state) => state.date)

      constructor() {
        effect(() => {
          console.log(this.storeVal())
        })
      }

      updateDate() {
        store.setState((v) => ({
          ...v,
          date: new Date('2025-03-29T21:06:40.401Z'),
        }))
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    const debugElement = fixture.debugElement

    expect(
      debugElement.query(By.css('p#displayStoreVal')).nativeElement.textContent,
    ).toContain(new Date('2025-03-29T21:06:30.401Z'))

    debugElement
      .query(By.css('button#updateDate'))
      .triggerEventHandler('click', null)

    fixture.detectChanges()
    expect(
      debugElement.query(By.css('p#displayStoreVal')).nativeElement.textContent,
    ).toContain(new Date('2025-03-29T21:06:40.401Z'))
  })
})
