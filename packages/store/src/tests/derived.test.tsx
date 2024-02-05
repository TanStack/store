import {Store} from "../store";
import {Derived} from "../derived";
import {expect, vi} from "vitest";

function viFnSubscribe(subscribable: Store<any> | Derived<any>) {
  const fn = vi.fn();
  subscribable.subscribe(() => fn(subscribable.state));
  return fn;
}

describe('Derived', () => {
  test("Pyramid dep problem", () => {
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
