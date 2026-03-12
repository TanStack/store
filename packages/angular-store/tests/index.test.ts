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
import { render } from '@testing-library/angular'
import userEvent from '@testing-library/user-event'
import { createStore } from '@tanstack/store'
import { injectStore } from '../src/index'
import type { OnInit } from '@angular/core'

const user = userEvent.setup()

function createStableSignal<T>(fn: () => T): () => T {
  return computed(() => untracked(fn))
}

const selectorReadsInputStore = createStore({ cats: 2, dogs: 4 })

describe('injectStore', () => {
  test(`allows us to select state using a selector`, async () => {
    const store = createStore({ select: 0, ignored: 1 })

    @Component({
      template: `<p>Store: {{ storeVal() }}</p>`,
      standalone: true,
    })
    class MyCmp {
      storeVal = injectStore(store, (state) => state.select)
    }

    const { getByText } = await render(MyCmp)
    expect(getByText('Store: 0')).toBeInTheDocument()
  })

  test('only triggers a re-render when selector state is updated', async () => {
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

    const { getByText, getByRole } = await render(MyCmp)
    expect(getByText('Store: 0')).toBeInTheDocument()
    expect(count).toEqual(1)

    await user.click(getByRole('button', { name: /update select/i }))
    expect(getByText('Store: 10')).toBeInTheDocument()
    expect(count).toEqual(2)

    await user.click(getByRole('button', { name: /update ignored/i }))
    expect(getByText('Store: 10')).toBeInTheDocument()
    expect(count).toEqual(2)
  })

  test('supports a store created inside a stable signal', () => {
    const count = signal(1)

    const storeVal = TestBed.runInInjectionContext(() => {
      const store = createStableSignal(() => createStore({ value: count() }))
      const storeVal = injectStore(
        () => store(),
        (state) => state.value,
      )

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

  test('supports a store created from input signals', async () => {
    @Component({
      template: `<p>{{ storeVal() }}</p>`,
      standalone: true,
    })
    class StoreFromInputChildCmp {
      value = input.required<number>()
      store = createStableSignal(() =>
        createStore({ doubled: this.value() * 2 }),
      )
      storeVal = injectStore(
        () => this.store(),
        (state) => state.doubled,
      )

      constructor() {
        effect(() => {
          this.store().setState(() => ({ doubled: this.value() * 2 }))
        })
      }
    }

    const value = signal(3)
    const { getByText, findByText } = await render(StoreFromInputChildCmp, {
      bindings: [inputBinding('value', value)],
    })
    expect(getByText('6')).toBeInTheDocument()

    value.set(4)
    expect(await findByText('8')).toBeInTheDocument()
  })

  test('supports selectors that read input signals', async () => {
    @Component({
      selector: 'app-selector-reads-input',
      template: `<p>{{ count() }}</p>`,
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
    const { getByText, findByText } = await render(SelectorReadsInputChildCmp, {
      bindings: [inputBinding('animal', animal)],
    })
    expect(getByText('2')).toBeInTheDocument()

    animal.set('dogs')
    expect(await findByText('4')).toBeInTheDocument()
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
      storeVal = injectStore(
        () => this.store(),
        (state) => state.doubled,
      )

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
  test('date change trigger re-render', async () => {
    const store = createStore({ date: new Date('2025-03-29T21:06:30.401Z') })

    @Component({
      template: `
        <div>
          <p>{{ storeVal() }}</p>
          <button (click)="updateDate()">Update date</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      storeVal = injectStore(store, (state) => state.date)

      updateDate() {
        store.setState((v) => ({
          ...v,
          date: new Date('2025-03-29T21:06:40.401Z'),
        }))
      }
    }

    const { getByText, getByRole, findByText } = await render(MyCmp)
    expect(
      getByText(new Date('2025-03-29T21:06:30.401Z').toString()),
    ).toBeInTheDocument()

    await user.click(getByRole('button', { name: /update date/i }))
    expect(
      await findByText(new Date('2025-03-29T21:06:40.401Z').toString()),
    ).toBeInTheDocument()
  })
})
