/// <reference lib="dom" />
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { userEvent } from '@testing-library/user-event'
import { LitElement, html } from 'lit'
import { createStore } from '@tanstack/store'
import { TanStackStoreSelector } from '../src'
import { defineOnce, mount } from './utils'

const user = userEvent.setup()

describe('Lit Store Tests', () => {
  it('should update when a store is selected with no selector', async () => {
    const counter = createStore(0)

    function add() {
      counter.setState((prev) => prev + 1)
    }

    class TestForm extends LitElement {
      _ = new TanStackStoreSelector(this, () => counter)

      render() {
        return html`<button id="btn" @click=${add}>${counter.state}</button>`
      }
    }

    const tag = defineOnce('test-form', TestForm)

    const element = await mount<TestForm>(tag)

    const getBtn = () =>
      element.shadowRoot!.querySelector<HTMLButtonElement>('#btn')

    expect(getBtn()).toHaveTextContent('0')

    expect(counter.state).toBe(0)

    await user.click(getBtn()!)
    expect(counter.state).toBe(1)
    expect(getBtn()).toHaveTextContent('1')
  })

  it('should update value setter is used', async () => {
    const counter = createStore(0)

    function add() {
      counter.setState((prev) => prev + 1)
    }

    class TestForm extends LitElement {
      #selector = new TanStackStoreSelector(this, () => counter)

      render() {
        return html`<button id="btn" @click=${add}>${this.#selector.value}</button>`
      }
    }

    const tag = defineOnce('test-form', TestForm)

    const element = await mount<TestForm>(tag)

    const getBtn = () =>
      element.shadowRoot!.querySelector<HTMLButtonElement>('#btn')

    expect(getBtn()).toHaveTextContent('0')
 
    expect(counter.state).toBe(0)

    await user.click(getBtn()!)
    expect(counter.state).toBe(1)
    expect(getBtn()).toHaveTextContent('1')
  })


  it('should ignore updates when a store is selected with a selector', async () => {
    const counter = createStore({ count: 0, ignore: 1 })

    function add() {
      counter.setState((prev) => ({ ...prev, count: prev.count + 1 }))
    }

    function addIgnore() {
      counter.setState((prev) => ({ ...prev, ignore: prev.ignore + 1 }))
    }

    class TestForm extends LitElement {
      _ = new TanStackStoreSelector(
        this,
        () => counter,
        (state) => state.count,
      )

      render() {
        return html`
          <button id="btn" @click=${add}>${counter.state.count}</button>
          <button id="ignore" @click=${addIgnore}>
            ${counter.state.ignore}
          </button>
        `
      }
    }

    const tag = defineOnce('test-form', TestForm)

    const element = await mount<TestForm>(tag)

    const getBtn = () =>
      element.shadowRoot!.querySelector<HTMLButtonElement>('#btn')

    const getIgnore = () =>
      element.shadowRoot!.querySelector<HTMLButtonElement>('#ignore')

    expect(getBtn()).toHaveTextContent('0')
    expect(getIgnore()).toHaveTextContent('1')

    await user.click(getBtn()!)
    expect(getBtn()).toHaveTextContent('1')
    expect(getIgnore()).toHaveTextContent('1')

    await user.click(getIgnore()!)
    expect(getBtn()).toHaveTextContent('1')
    expect(getIgnore()).toHaveTextContent('1')
  })
})
