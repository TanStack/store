import {Store} from "../store";
import {Derived} from "../derived";
import {afterEach, expect, vi} from "vitest";

function viFnSubscribe(subscribable: Store<any> | Derived<any>) {
  const fn = vi.fn();
  const cleanup = subscribable.subscribe(() => fn(subscribable.state));
  afterEach(() => {
    cleanup()
  })
  return fn;
}

describe('Derived', () => {
  test("Diamond dep problem", () => {
    const count = new Store(10);

    const halfCount = new Derived([count], () => {
      return count.state / 2;
    })

    const doubleCount = new Derived([count], () => {
      return count.state * 2;
    })

    const sumDoubleHalfCount = new Derived([halfCount, doubleCount], () => {
      return halfCount.state + doubleCount.state;
    })

    const halfCountFn = viFnSubscribe(halfCount);
    const doubleCountFn = viFnSubscribe(doubleCount);
    const sumDoubleHalfCountFn = viFnSubscribe(sumDoubleHalfCount);

    count.setState(() => 20)

    expect(halfCountFn).toHaveBeenNthCalledWith(1, 10)
    expect(doubleCountFn).toHaveBeenNthCalledWith(1, 40)
    expect(sumDoubleHalfCountFn).toHaveBeenNthCalledWith(1, 50)

    count.setState(() => 30)

    expect(halfCountFn).toHaveBeenNthCalledWith(2, 15)
    expect(doubleCountFn).toHaveBeenNthCalledWith(2, 60)
    expect(sumDoubleHalfCountFn).toHaveBeenNthCalledWith(2, 75)
  })


  /**
   *         A
   *        / \
   *       B   C
   *      / \  |
   *     D  E  F
   *      \ / |
   *       \ /
   *        G
   */
  test("Complex diamond dep problem", () => {
    const a = new Store(1);
    const b = new Derived([a], () => a.state)
    const c = new Derived([a], () => a.state)
    const d = new Derived([b], () => b.state)
    const e = new Derived([b], () => b.state)
    const f = new Derived([c], () => c.state)
    const g = new Derived([d, e, f], () => d.state + e.state + f.state);

    const aFn = viFnSubscribe(a);
    const bFn = viFnSubscribe(b);
    const cFn = viFnSubscribe(c);
    const dFn = viFnSubscribe(d);
    const eFn = viFnSubscribe(e);
    const fFn = viFnSubscribe(f);
    const gFn = viFnSubscribe(g);

    a.setState(() => 2)

    expect(aFn).toHaveBeenNthCalledWith(1, 2)
    expect(bFn).toHaveBeenNthCalledWith(1, 2)
    expect(cFn).toHaveBeenNthCalledWith(1, 2)
    expect(dFn).toHaveBeenNthCalledWith(1, 2)
    expect(eFn).toHaveBeenNthCalledWith(1, 2)
    expect(fFn).toHaveBeenNthCalledWith(1, 2)
    expect(gFn).toHaveBeenNthCalledWith(1, 6)
  })


  test("Derive from store and another derived", () => {
    const count = new Store(10);

    const doubleCount = new Derived([count], () => {
      return count.state * 2;
    })

    const tripleCount = new Derived([count, doubleCount], () => {
      return count.state + doubleCount.state;
    })

    const doubleCountFn = viFnSubscribe(doubleCount);
    const tripleCountFn = viFnSubscribe(tripleCount);

    count.setState(() => 20)

    expect(doubleCountFn).toHaveBeenNthCalledWith(1, 40)
    expect(tripleCountFn).toHaveBeenNthCalledWith(1, 60)

    count.setState(() => 30)

    expect(doubleCountFn).toHaveBeenNthCalledWith(2, 60)
    expect(tripleCountFn).toHaveBeenNthCalledWith(2, 90)
  })
});
