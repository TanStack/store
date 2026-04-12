import { describe, expect, test } from 'vitest'
import { Component, effect } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { createAtom, createStore } from '@tanstack/store'
import {
  injectAtom,
  injectSelector,
  injectSetValue,
  injectStore,
  injectStoreActions,
  injectValue,
} from '../src/index'

describe('atom hooks', () => {
  test('injectValue reads mutable atom state and rerenders when updated', () => {
    const atom = createAtom(0)

    @Component({
      template: `
        <div>
          <p>Value: {{ value() }}</p>
          <button id="update" (click)="update()">Update</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      value = injectValue(atom)

      update() {
        atom.set((prev) => prev + 1)
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Value: 0')

    fixture.debugElement
      .query(By.css('button#update'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Value: 1')
  })

  test('injectAtom returns the current signal and setter', () => {
    const atom = createAtom(0)

    @Component({
      template: `
        <div>
          <p>Value: {{ value() }}</p>
          <button id="add" (click)="add()">Add 5</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      value!: ReturnType<typeof injectAtom<number>>[0]
      setValue!: ReturnType<typeof injectAtom<number>>[1]

      constructor() {
        ;[this.value, this.setValue] = injectAtom(atom)
      }

      add() {
        this.setValue((prev) => prev + 5)
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Value: 0')

    fixture.debugElement
      .query(By.css('button#add'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Value: 5')
  })
})

describe('selector hooks', () => {
  test('allows us to select state using a selector', () => {
    const store = createStore({ select: 0, ignored: 1 })

    @Component({
      template: `<p>Store: {{ storeVal() }}</p>`,
      standalone: true,
    })
    class MyCmp {
      storeVal = injectSelector(store, (state) => state.select)
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Store: 0')
  })

  test('injectValue reads writable and readonly store state', () => {
    const baseStore = createStore(1)
    const readonlyStore = createStore(() => ({ value: baseStore.state * 2 }))

    @Component({
      template: `
        <div>
          <p id="value">{{ value() }}</p>
          <p id="readonly">{{ readonlyValue().value }}</p>
          <button id="update" (click)="update()">Update</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      value = injectValue(baseStore)
      readonlyValue = injectValue(readonlyStore)

      update() {
        baseStore.setState((prev) => prev + 1)
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(
      fixture.debugElement.query(By.css('p#value')).nativeElement.textContent,
    ).toContain('1')
    expect(
      fixture.debugElement.query(By.css('p#readonly')).nativeElement
        .textContent,
    ).toContain('2')

    fixture.debugElement
      .query(By.css('button#update'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()

    expect(
      fixture.debugElement.query(By.css('p#value')).nativeElement.textContent,
    ).toContain('2')
    expect(
      fixture.debugElement.query(By.css('p#readonly')).nativeElement
        .textContent,
    ).toContain('4')
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
      storeVal = injectSelector(store, (state) => state.select)

      constructor() {
        effect(() => {
          this.storeVal()
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

    expect(fixture.nativeElement.textContent).toContain('Store: 0')
    expect(count).toEqual(1)

    fixture.debugElement
      .query(By.css('button#updateSelect'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Store: 10')
    expect(count).toEqual(2)

    fixture.debugElement
      .query(By.css('button#updateIgnored'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Store: 10')
    expect(count).toEqual(2)
  })

  test('injectSelector allows specifying a custom equality function', () => {
    const store = createStore({
      array: [
        { select: 0, ignore: 1 },
        { select: 0, ignore: 1 },
      ],
    })
    let count = 0

    @Component({
      template: `
        <div>
          <p id="sum">{{ sum() }}</p>
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
      sum = injectSelector(
        store,
        (state) =>
          state.array
            .map(({ ignore, ...rest }) => rest)
            .reduce((total, item) => total + item.select, 0),
        {
          compare: (prev, next) => prev === next,
        },
      )

      constructor() {
        effect(() => {
          this.sum()
          count++
        })
      }

      updateSelect() {
        store.setState((v) => ({
          array: v.array.map((item) => ({
            ...item,
            select: item.select + 5,
          })),
        }))
      }

      updateIgnored() {
        store.setState((v) => ({
          array: v.array.map((item) => ({
            ...item,
            ignore: item.ignore + 1,
          })),
        }))
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('0')
    expect(count).toBe(1)

    fixture.debugElement
      .query(By.css('button#updateIgnored'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()
    expect(count).toBe(1)

    fixture.debugElement
      .query(By.css('button#updateSelect'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('10')
    expect(count).toBe(2)
  })

  test('injectSelector works with mounted derived stores', () => {
    const store = createStore(0)
    const derived = createStore(() => ({ val: store.state * 2 }))

    @Component({
      template: `
        <div>
          <p id="derived">{{ derivedVal() }}</p>
          <button id="update" (click)="update()">Update</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      derivedVal = injectSelector(derived, (state) => state.val)

      update() {
        store.setState((prev) => prev + 1)
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()
    expect(
      fixture.debugElement.query(By.css('p#derived')).nativeElement.textContent,
    ).toContain('0')

    fixture.debugElement
      .query(By.css('button#update'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()

    expect(
      fixture.debugElement.query(By.css('p#derived')).nativeElement.textContent,
    ).toContain('2')
  })

  test('injectSetValue updates stores by updater', () => {
    const store = createStore(0)

    @Component({
      template: `<button id="update" (click)="update()">Update</button>`,
      standalone: true,
    })
    class MyCmp {
      updateState = injectSetValue(store)

      update() {
        this.updateState((prev) => prev + 1)
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    fixture.debugElement
      .query(By.css('button#update'))
      .triggerEventHandler('click', null)
    expect(store.state).toBe(1)
  })

  test('injectStoreActions returns the stable actions bag', () => {
    const store = createStore({ count: 0 }, ({ set }) => ({
      inc: () => set((prev) => ({ count: prev.count + 1 })),
    }))

    @Component({
      template: `<button id="update" (click)="update()">Update</button>`,
      standalone: true,
    })
    class MyCmp {
      actions = injectStoreActions(store)

      update() {
        this.actions.inc()
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    fixture.debugElement
      .query(By.css('button#update'))
      .triggerEventHandler('click', null)
    expect(store.state.count).toBe(1)
  })
})

describe('injectStore', () => {
  test('is a compatibility alias for injectSelector', () => {
    const store = createStore({ select: 0 })

    @Component({
      template: `<p>Store: {{ storeVal() }}</p>`,
      standalone: true,
    })
    class MyCmp {
      storeVal = injectStore(store, (state) => state.select)
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Store: 0')
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
      storeVal = injectSelector(store, (state) => state.date)

      updateDate() {
        store.setState((v) => ({
          ...v,
          date: new Date('2025-03-29T21:06:40.401Z'),
        }))
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(
      fixture.debugElement.query(By.css('p#displayStoreVal')).nativeElement
        .textContent,
    ).toContain(new Date('2025-03-29T21:06:30.401Z'))

    fixture.debugElement
      .query(By.css('button#updateDate'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()
    expect(
      fixture.debugElement.query(By.css('p#displayStoreVal')).nativeElement
        .textContent,
    ).toContain(new Date('2025-03-29T21:06:40.401Z'))
  })
})
