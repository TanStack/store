/// <reference lib="dom" />
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { userEvent } from '@testing-library/user-event'
import { LitElement, html } from 'lit'
import { createAtom } from '@tanstack/store'
import { TanStackStoreAtom } from '../src'
import { defineOnce, mount } from './utils'

const user = userEvent.setup()

describe('TanStackAtom', () => {
  it('returns the current value and setter', async () => {
    const atom = createAtom(0)

    class TestAtomEl extends LitElement {
      atomCtrl = new TanStackStoreAtom(this, () => atom)

      render() {
        return html`
          <button
            id="btn"
            @click=${() => this.atomCtrl.set((prev) => prev + 5)}
          >
            ${this.atomCtrl.value}
          </button>
        `
      }
    }

    defineOnce('test-atom-el', TestAtomEl)

    const element = await mount<TestAtomEl>('test-atom-el')

    const getBtn = () =>
      element.shadowRoot!.querySelector<HTMLButtonElement>('#btn')

    expect(getBtn()).toHaveTextContent('0')
    expect(atom.get()).toBe(0)

    await user.click(getBtn()!)

    expect(atom.get()).toBe(5)
    expect(getBtn()).toHaveTextContent('5')
  })
})
