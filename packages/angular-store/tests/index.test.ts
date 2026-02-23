import { describe, expect, test } from 'vitest'
import {
  Component,
  effect,
  input,
  inputBinding,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { createStore } from '@tanstack/store'
import { injectLazyStore, injectStore } from '../src/index'
import { stableSignal } from '../src/injectLazyStore'

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
})

describe('injectLazyStore', () => {
  test('selects state using a selector when store is provided via a signal', () => {
    const storeSignal = stableSignal(() => createStore({ select: 42, other: 1 }))

    @Component({
      template: `<p>Lazy: {{ storeVal() }}</p>`,
      standalone: true,
    })
    class MyCmp {
      storeVal = injectLazyStore(storeSignal, (state) => state.select)
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    const element = fixture.nativeElement
    expect(element.textContent).toContain('Lazy: 42')
  })

  test('accepts signal input in the store signal (computed store from input)', () => {
    @Component({
      template: `<p id="val">Val: {{ storeVal() }}</p>`,
      standalone: true,
    })
    class MyCmp {
      public argument = input.required<number>()
      private lazyStore = stableSignal(() =>
        createStore({ select: this.argument(), other: 0 })
      )

      storeVal = injectLazyStore(this.lazyStore, (state) => state.select)
    }
    const value = signal(1)

    const fixture = TestBed.createComponent(MyCmp, {
      bindings: [inputBinding('argument', () => value())],
    })
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('#val').textContent).toContain(
      'Val: 1',
    )
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
