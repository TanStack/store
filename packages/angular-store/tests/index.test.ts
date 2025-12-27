import { describe, expect, test } from 'vitest'
import { Component, effect } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { createAtom } from '@xstate/store'
import { injectStore } from '../src/index'

describe('injectStore', () => {
  test(`allows us to select state using a selector`, () => {
    const store = createAtom({ select: 0, ignored: 1 })

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
    const store = createAtom({ select: 0, ignored: 1 })
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
        store.set((v) => ({
          ...v,
          select: 10,
        }))
      }

      updateIgnored() {
        store.set((v) => ({
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

describe('dataType', () => {
  test('date change trigger re-render', () => {
    const store = createAtom({ date: new Date('2025-03-29T21:06:30.401Z') })

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
        store.set((v) => ({
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
