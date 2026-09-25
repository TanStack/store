import { describe, expect, test } from 'vitest'
import {
  Component,
  computed,
  effect,
  input,
  inputBinding,
  isSignal,
  signal,
  untracked,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { fireEvent, render, waitFor } from '@testing-library/angular'
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
  test('injectAtom returns an Angular signal', () => {
    const atom = createAtom(0)

    const count = TestBed.runInInjectionContext(() => injectAtom(atom))

    expect(isSignal(count)).toBe(true)
  })

  test('injectSelector reads mutable atom state and rerenders when updated', async () => {
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

    const { getByRole, getByText } = await render(MyCmp)

    expect(getByText('Value: 0')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(getByText('Value: 1')).toBeInTheDocument())
  })

  test('injectAtom returns a callable signal with a set method', async () => {
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

    const { getByRole, getByText } = await render(MyCmp)

    expect(getByText('Value: 0')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Add 5' }))

    await waitFor(() => expect(getByText('Value: 5')).toBeInTheDocument())
  })

  test('injectAtom set accepts a direct value', async () => {
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

    const { getByRole, getByText } = await render(MyCmp)

    expect(getByText('Value: 42')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Reset' }))

    await waitFor(() => expect(getByText('Value: 0')).toBeInTheDocument())
  })

  test('injectAtom supports atoms created from input signals', async () => {
    @Component({
      template: `<p>{{ doubled() }}</p>`,
      standalone: true,
    })
    class AtomFromInputChildCmp {
      value = input.required<number>()
      // createStableSignal/untracked creates the atom once from the initial input;
      // the effect below propagates later input changes into that atom.
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
  test('injectSelector returns an Angular signal', () => {
    const store = createStore(0)

    const value = TestBed.runInInjectionContext(() => injectSelector(store))

    expect(isSignal(value)).toBe(true)
  })

  test('allows us to select state using a selector', () => {
    const store = createStore({ select: 0, ignored: 1 })

    const storeVal = TestBed.runInInjectionContext(() =>
      injectSelector(store, (state) => state.select),
    )

    expect(storeVal()).toBe(0)
  })

  test('injectSelector reads writable and readonly store state', async () => {
    const baseStore = createStore(1)
    const readonlyStore = createStore(() => ({ value: baseStore.state * 2 }))

    @Component({
      template: `
        <div>
          <p>Value: {{ value() }}</p>
          <p>Readonly: {{ readonlyValue().value }}</p>
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

    const { getByRole, getByText } = await render(MyCmp)

    expect(getByText('Value: 1')).toBeInTheDocument()
    expect(getByText('Readonly: 2')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Update' }))

    await waitFor(() => {
      expect(getByText('Value: 2')).toBeInTheDocument()
      expect(getByText('Readonly: 4')).toBeInTheDocument()
    })
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

    const { getByRole, getByText } = await render(MyCmp)

    expect(getByText('Store: 0')).toBeInTheDocument()
    expect(count).toEqual(1)

    fireEvent.click(getByRole('button', { name: 'Update select' }))
    await waitFor(() => {
      expect(getByText('Store: 10')).toBeInTheDocument()
      expect(count).toEqual(2)
    })

    fireEvent.click(getByRole('button', { name: 'Update ignored' }))
    expect(getByText('Store: 10')).toBeInTheDocument()
    expect(count).toEqual(2)
  })

  test('injectSelector allows specifying a custom equality function', async () => {
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
          <p>Sum: {{ sum() }}</p>
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

    const { getByRole, getByText } = await render(MyCmp)

    expect(getByText('Sum: 0')).toBeInTheDocument()
    expect(count).toBe(1)

    fireEvent.click(getByRole('button', { name: 'Update ignored' }))
    expect(count).toBe(1)

    fireEvent.click(getByRole('button', { name: 'Update select' }))
    await waitFor(() => {
      expect(getByText('Sum: 10')).toBeInTheDocument()
      expect(count).toBe(2)
    })
  })

  test('injectSelector works with mounted derived stores', async () => {
    const store = createStore(0)
    const derived = createStore(() => ({ val: store.state * 2 }))

    @Component({
      template: `
        <div>
          <p>Derived: {{ derivedVal() }}</p>
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

    const { getByRole, getByText } = await render(MyCmp)
    expect(getByText('Derived: 0')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(getByText('Derived: 2')).toBeInTheDocument())
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

  test('injectSelector accepts a lazy store factory', () => {
    const store = createStore({ select: 1 })

    const value = TestBed.runInInjectionContext(() =>
      injectSelector(() => store, (state) => state.select),
    )

    expect(value()).toBe(1)
  })

  test('injectSelector supports lazy store factories from input signals', async () => {
    @Component({
      template: `<p>{{ count() }}</p>`,
      standalone: true,
    })
    class LazyStoreFromInputCmp {
      initial = input.required<number>()
      // Stable factory so the store is created once; later updates go through setState.
      store = createStableSignal(() => createStore({ count: this.initial() }))
      count = injectSelector(this.store, (state) => state.count)

      constructor() {
        effect(() => {
          this.store().setState(() => ({ count: this.initial() }))
        })
      }
    }

    const initial = signal(5)
    const { getByText, findByText } = await render(LazyStoreFromInputCmp, {
      bindings: [inputBinding('initial', initial)],
    })

    expect(getByText('5')).toBeInTheDocument()

    initial.set(9)
    expect(await findByText('9')).toBeInTheDocument()
  })

  test('injectSelector reflects store updates between first read and effect subscription', async () => {
    const store = createStore(1)

    @Component({
      template: `<p>{{ value() }}</p>`,
      standalone: true,
    })
    class EarlyReadCmp {
      value = injectSelector(store)

      ngOnInit() {
        // First read caches a snapshot before the effect connects. Updating here
        // must still be visible after subscription + invalidate-on-connect.
        expect(this.value()).toBe(1)
        store.setState(() => 2)
      }
    }

    const { findByText } = await render(EarlyReadCmp)
    expect(await findByText('2')).toBeInTheDocument()
  })
})

describe('injectStore', () => {
  test('is a compatibility alias for injectSelector', () => {
    const store = createStore({ select: 0 })

    const storeVal = TestBed.runInInjectionContext(() =>
      injectStore(store, (state) => state.select),
    )

    expect(storeVal()).toBe(0)
  })
})

describe('dataType', () => {
  test('date change trigger re-render', async () => {
    const store = createStore({ date: new Date('2025-03-29T21:06:30.401Z') })

    @Component({
      template: `
        <div>
          <p>Date: {{ storeVal().toISOString() }}</p>
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

    const { getByRole, getByText } = await render(MyCmp)

    expect(getByText('Date: 2025-03-29T21:06:30.401Z')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Update date' }))
    await waitFor(() =>
      expect(getByText('Date: 2025-03-29T21:06:40.401Z')).toBeInTheDocument(),
    )
  })
})

describe('_injectStore', () => {
  test('return value passes isSignal (proxies the selector signal)', () => {
    TestBed.runInInjectionContext(() => {
      const store = createStore(0)
      const slice = _injectStore(store, (s) => s)
      expect(isSignal(slice)).toBe(true)
    })
  })

  test('returns selected state and actions for stores with actions', async () => {
    const store = createStore({ count: 0 }, ({ setState }) => ({
      inc: () => setState((prev) => ({ count: prev.count + 1 })),
    }))

    @Component({
      template: `
        <div>
          <p>Count: {{ count() }}</p>
          <button id="inc" (click)="inc()">Inc</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      protected count = _injectStore(store, (state) => state.count)

      inc() {
        this.count.inc()
      }
    }

    const { getByRole, getByText } = await render(MyCmp)

    expect(getByText('Count: 0')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Inc' }))

    await waitFor(() => expect(getByText('Count: 1')).toBeInTheDocument())
  })

  test('returns selected state and setState for plain stores', async () => {
    const store = createStore(0)

    @Component({
      template: `
        <div>
          <p>Value: {{ value() }}</p>
          <button id="inc" (click)="inc()">Inc</button>
        </div>
      `,
      standalone: true,
    })
    class MyCmp {
      protected value = _injectStore(store, (state) => state)

      inc() {
        this.value.setState((prev: number) => prev + 1)
      }
    }

    const { getByRole, getByText } = await render(MyCmp)

    expect(getByText('Value: 0')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Inc' }))

    await waitFor(() => expect(getByText('Value: 1')).toBeInTheDocument())
  })

  test('supports lazy store factories when exposing actions', async () => {
    @Component({
      template: `
        <p>{{ count() }}</p>
        <button id="inc" (click)="count.inc()">Inc</button>
      `,
      standalone: true,
    })
    class LazyStoreCmp {
      initial = input.required<number>()
      store = createStableSignal(() =>
        createStore({ count: this.initial() }, ({ setState }) => ({
          inc: () => setState((prev) => ({ count: prev.count + 1 })),
        })),
      )
      count = _injectStore(this.store, (state) => state.count)
    }

    const initial = signal(1)
    const { getByText, container } = await render(LazyStoreCmp, {
      bindings: [inputBinding('initial', initial)],
    })

    expect(getByText('1')).toBeInTheDocument()
    container.querySelector<HTMLButtonElement>('button#inc')?.click()
    await waitFor(() => expect(getByText('2')).toBeInTheDocument())
  })
})

describe('createStoreContext', () => {
  test('provides and injects a typed store context', async () => {
    const { provideStoreContext, injectStoreContext } = createStoreContext<{
      countAtom: Atom<number>
      petStore: Store<{ cats: number; dogs: number }>
    }>()

    @Component({
      template: `
        <div>
          <p>Count: {{ count() }}</p>
          <p>Cats: {{ cats() }}</p>
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

    const { getByRole, getByText } = await render(MyCmp)

    expect(getByText('Count: 10')).toBeInTheDocument()
    expect(getByText('Cats: 2')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Inc' }))
    await waitFor(() => expect(getByText('Count: 11')).toBeInTheDocument())

    fireEvent.click(getByRole('button', { name: 'Add cat' }))
    await waitFor(() => expect(getByText('Cats: 3')).toBeInTheDocument())
  })

  test('throws when injectStoreContext is called without a provider', () => {
    const { injectStoreContext } = createStoreContext<{
      countAtom: Atom<number>
    }>()

    expect(() =>
      TestBed.runInInjectionContext(() => injectStoreContext()),
    ).toThrow(/Missing StoreContext provider/)
  })
})
