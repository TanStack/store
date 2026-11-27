/// <reference lib="dom" />
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { userEvent } from '@testing-library/user-event'
import { LitElement, html } from 'lit'
import { createStore, shallow } from '@tanstack/store'
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
        return html`<button id="btn" @click=${add}>
          ${this.#selector.value}
        </button>`
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

  it('should select again when a host property read by the selector changes', async () => {
    const store = createStore({ dogs: 3, cats: 7 })

    class TestForm extends LitElement {
      static properties = { animal: {} }
      animal: 'dogs' | 'cats' = 'dogs'

      #count = new TanStackStoreSelector(
        this,
        () => store,
        (state) => state[this.animal],
      )

      render() {
        return html`<p id="count">${this.#count.value}</p>`
      }
    }

    const tag = defineOnce('test-form', TestForm)

    const element = await mount<TestForm>(tag)

    const getCount = () => element.shadowRoot!.querySelector('#count')

    expect(getCount()).toHaveTextContent('3')

    element.animal = 'cats'
    await element.updateComplete
    expect(getCount()).toHaveTextContent('7')
  })

  it('should keep updating after the element is moved', async () => {
    const counter = createStore({ count: 0 })

    class TestForm extends LitElement {
      selection = new TanStackStoreSelector(
        this,
        () => counter,
        (state) => ({ count: state.count }),
        { compare: shallow },
      )

      render() {
        return html`<p id="count">${this.selection.value?.count}</p>`
      }
    }

    const tag = defineOnce('test-form', TestForm)

    const element = await mount<TestForm>(tag)

    const getCount = () => element.shadowRoot!.querySelector('#count')

    expect(getCount()).toHaveTextContent('0')

    const selected = element.selection.value
    document.body.appendChild(element)
    await element.updateComplete
    expect(element.selection.value).toBe(selected)

    counter.setState(() => ({ count: 1 }))
    await element.updateComplete
    expect(getCount()).toHaveTextContent('1')
  })

  it('should stop updating after the element is removed', async () => {
    const counter = createStore(0)
    let renders = 0

    class TestForm extends LitElement {
      #count = new TanStackStoreSelector(this, () => counter)

      render() {
        renders++
        return html`<p id="count">${this.#count.value}</p>`
      }
    }

    const tag = defineOnce('test-form', TestForm)

    const element = await mount<TestForm>(tag)

    counter.setState(() => 1)
    element.remove()
    await element.updateComplete
    const rendersAfterRemove = renders

    counter.setState(() => 2)
    await element.updateComplete
    expect(renders).toBe(rendersAfterRemove)
  })
})
