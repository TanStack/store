import {Store} from "../store";
import {Derived} from "../derived";

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
  }, {debug: true})

  sumDoubleHalfCount.subscribe(() => {
    // This console should only run once
    console.warn(sumDoubleHalfCount)
  })

  count.setState(() => 20)
})
