import { describe, expect, test } from 'vitest'
import {
  Component,
  computed,
  effect,
  input,
  inputBinding,
  signal,
  untracked,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { render } from '@testing-library/angular'
import { Store, createAtom, createStore } from '@tanstack/store'
import {
  _injectStore,
  createStoreContext,
  injectAtom,
  injectSelector,
  injectStore,
} from '../src/index'
import type { Atom } from '@tanstack/store'

function createStableSignal<T>(fn: () => T): () => T {
  return computed(() => untracked(fn))
}

describe('atom hooks', () => {
  test('injectSelector reads mutable atom state and rerenders when updated', () => {
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
      value = injectSelector(atom)

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

  test('injectAtom returns a callable signal with a set method', () => {
    const atom = createAtom(0)

    @Component({
      template: `
        <div>
          <p>Value: {{ count() }}</p>
          <button id="add" (click)="add()">Add 5</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      count = injectAtom(atom)

      add() {
        this.count.set((prev) => prev + 5)
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

  test('injectAtom set accepts a direct value', () => {
    const atom = createAtom(0)

    @Component({
      template: `
        <div>
          <p>Value: {{ count() }}</p>
          <button id="reset" (click)="reset()">Reset</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      count = injectAtom(atom)

      constructor() {
        this.count.set(42)
      }

      reset() {
        this.count.set(0)
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Value: 42')

    fixture.debugElement
      .query(By.css('button#reset'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Value: 0')
  })

  test('injectAtom supports atoms created from input signals', async () => {
    @Component({
      template: `<p>{{ doubled() }}</p>`,
      standalone: true,
    })
    class AtomFromInputChildCmp {
      value = input.required<number>()
      atom = createStableSignal(() => createAtom(this.value() * 2))
      doubled = injectAtom(this.atom)

      constructor() {
        effect(() => {
          this.doubled.set(this.value() * 2)
        })
      }
    }

    const value = signal(3)
    const { getByText, findByText } = await render(AtomFromInputChildCmp, {
      bindings: [inputBinding('value', value)],
    })

    expect(getByText('6')).toBeInTheDocument()

    value.set(4)
    expect(await findByText('8')).toBeInTheDocument()
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

  test('injectSelector reads writable and readonly store state', () => {
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
      value = injectSelector(baseStore)
      readonlyValue = injectSelector(readonlyStore)

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

  test('injectSelector supports selectors that read input signals', async () => {
    const selectorReadsInputStore = createStore({ cats: 2, dogs: 4 })

    @Component({
      template: `<p>{{ count() }}</p>`,
      standalone: true,
    })
    class SelectorReadsInputChildCmp {
      animal = input.required<'cats' | 'dogs'>()
      count = injectSelector(
        selectorReadsInputStore,
        (state) => state[this.animal()],
      )
    }

    const animal = signal<'cats' | 'dogs'>('cats')
    const { getByText, findByText } = await render(SelectorReadsInputChildCmp, {
      bindings: [inputBinding('animal', animal)],
    })

    expect(getByText('2')).toBeInTheDocument()

    animal.set('dogs')
    expect(await findByText('4')).toBeInTheDocument()
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

describe('_injectStore', () => {
  test('returns selected state and actions for stores with actions', () => {
    const store = createStore({ count: 0 }, ({ setState }) => ({
      inc: () => setState((prev) => ({ count: prev.count + 1 })),
    }))

    @Component({
      template: `
        <div>
          <p id="count">{{ count() }}</p>
          <button id="inc" (click)="inc()">Inc</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      private result = _injectStore(store, (state) => state.count)
      count = this.result[0]
      actions = this.result[1]

      inc() {
        this.actions.inc()
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(
      fixture.debugElement.query(By.css('p#count')).nativeElement.textContent,
    ).toContain('0')

    fixture.debugElement
      .query(By.css('button#inc'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()

    expect(
      fixture.debugElement.query(By.css('p#count')).nativeElement.textContent,
    ).toContain('1')
  })

  test('returns selected state and setState for plain stores', () => {
    const store = createStore(0)

    @Component({
      template: `
        <div>
          <p id="value">{{ value() }}</p>
          <button id="inc" (click)="inc()">Inc</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      private result = _injectStore(store, (state) => state)
      value = this.result[0]
      setState = this.result[1]

      inc() {
        this.setState((prev) => prev + 1)
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(
      fixture.debugElement.query(By.css('p#value')).nativeElement.textContent,
    ).toContain('0')

    fixture.debugElement
      .query(By.css('button#inc'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()

    expect(
      fixture.debugElement.query(By.css('p#value')).nativeElement.textContent,
    ).toContain('1')
  })
})

describe('createStoreContext', () => {
  test('provides and injects a typed store context', () => {
    const { provideStoreContext, injectStoreContext } = createStoreContext<{
      countAtom: Atom<number>
      petStore: Store<{ cats: number; dogs: number }>
    }>()

    @Component({
      template: `
        <div>
          <p id="count">{{ count() }}</p>
          <p id="cats">{{ cats() }}</p>
          <button id="inc" (click)="inc()">Inc</button>
          <button id="addCat" (click)="addCat()">Add cat</button>
        </div>
      `,
      standalone: true,
      providers: [
        provideStoreContext(() => ({
          countAtom: createAtom(10),
          petStore: new Store({ cats: 2, dogs: 3 }),
        })),
      ],
    })
    class MyCmp {
      private ctx = injectStoreContext()
      count = injectSelector(this.ctx.countAtom)
      cats = injectSelector(this.ctx.petStore, (s) => s.cats)

      inc() {
        this.ctx.countAtom.set((prev) => prev + 1)
      }

      addCat() {
        this.ctx.petStore.setState((prev) => ({
          ...prev,
          cats: prev.cats + 1,
        }))
      }
    }

    const fixture = TestBed.createComponent(MyCmp)
    fixture.detectChanges()

    expect(
      fixture.debugElement.query(By.css('p#count')).nativeElement.textContent,
    ).toContain('10')
    expect(
      fixture.debugElement.query(By.css('p#cats')).nativeElement.textContent,
    ).toContain('2')

    fixture.debugElement
      .query(By.css('button#inc'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()
    expect(
      fixture.debugElement.query(By.css('p#count')).nativeElement.textContent,
    ).toContain('11')

    fixture.debugElement
      .query(By.css('button#addCat'))
      .triggerEventHandler('click', null)
    fixture.detectChanges()
    expect(
      fixture.debugElement.query(By.css('p#cats')).nativeElement.textContent,
    ).toContain('3')
  })

  test('throws when injectStoreContext is called without a provider', () => {
    const { injectStoreContext } = createStoreContext<{
      countAtom: Atom<number>
    }>()

    @Component({
      template: `<p>{{ count() }}</p>`,
      standalone: true,
    })
    class MyCmp {
      private ctx = injectStoreContext()
      count = injectSelector(this.ctx.countAtom)
    }

    expect(() => TestBed.createComponent(MyCmp)).toThrow(
      /Missing StoreContext provider/,
    )
  })
})
