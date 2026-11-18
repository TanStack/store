export function compareShallow<T>(objA: T, objB: T): boolean {
  return _evaluate(objA, objB, { mode: 'shallow' }, createSeen())
}

export function compareDeep<T>(objA: T, objB: T): boolean {
  return _evaluate(objA, objB, { mode: 'deep' }, createSeen())
}

type PairSet = WeakMap<object, WeakSet<object>>

interface Seen {
  // stack depth of each pair still being compared further up the stack
  inProgress: WeakMap<object, Map<object, number>>
  // pairs proven equal
  equal: PairSet
  // depth of the pair being compared
  depth: number
  // shallowest in-progress pair assumed equal below the current one
  lowestAssumed: number
}

function createSeen(): Seen {
  return {
    inProgress: new WeakMap(),
    equal: new WeakMap(),
    depth: 0,
    lowestAssumed: Infinity,
  }
}

function hasPair(pairs: PairSet, a: object, b: object): boolean {
  return pairs.get(a)?.has(b) ?? false
}

function addPair(pairs: PairSet, a: object, b: object): void {
  let set = pairs.get(a)
  if (!set) {
    set = new WeakSet()
    pairs.set(a, set)
  }
  set.add(b)
}

function _evaluate<T>(
  objA: T,
  objB: T,
  config: { mode: 'shallow' | 'deep' },
  seen: Seen,
): boolean {
  if (Object.is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  if (config.mode === 'shallow') {
    return _evaluateObjects(objA, objB, config, seen)
  }

  if (hasPair(seen.equal, objA, objB)) return true

  // guards against circular references: a pair that is still being compared
  // further up the stack is assumed equal. A pair is cached as equal only if
  // every pair it assumed was itself or one below it, all now complete, so a
  // failed comparison (e.g. while matching Set elements) is never remembered
  // as a success.
  const assumedDepth = seen.inProgress.get(objA)?.get(objB)
  if (assumedDepth !== undefined) {
    seen.lowestAssumed = Math.min(seen.lowestAssumed, assumedDepth)
    return true
  }

  let pairs = seen.inProgress.get(objA)
  if (!pairs) {
    pairs = new Map()
    seen.inProgress.set(objA, pairs)
  }
  const depth = ++seen.depth
  pairs.set(objB, depth)
  const outerLowestAssumed = seen.lowestAssumed
  seen.lowestAssumed = Infinity

  try {
    const result = _evaluateObjects(objA, objB, config, seen)
    if (result && seen.lowestAssumed >= depth) {
      addPair(seen.equal, objA, objB)
    }
    return result
  } finally {
    pairs.delete(objB)
    seen.depth--
    // assumptions about pairs above this one still apply to them
    const innerLowestAssumed = seen.lowestAssumed
    seen.lowestAssumed = Math.min(
      outerLowestAssumed,
      innerLowestAssumed < depth ? innerLowestAssumed : Infinity,
    )
  }
}

function _evaluateObjects<T>(
  objA: T & object,
  objB: T & object,
  config: { mode: 'shallow' | 'deep' },
  seen: Seen,
): boolean {
  // guards against runtime cross type evaluation
  if (Object.getPrototypeOf(objA) !== Object.getPrototypeOf(objB)) {
    return false
  }

  if (objA instanceof Date && objB instanceof Date) {
    return objA.getTime() === objB.getTime()
  }

  if (
    typeof File !== 'undefined' &&
    objA instanceof File &&
    objB instanceof File
  ) {
    return (
      objA.name === objB.name &&
      objA.size === objB.size &&
      objA.type === objB.type &&
      objA.lastModified === objB.lastModified
    )
  }

  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false

    if (config.mode === 'deep') {
      for (const [k, v] of objA) {
        if (!objB.has(k) || !_evaluate(v, objB.get(k), config, seen))
          return false
      }
    }

    if (config.mode === 'shallow') {
      for (const [k, v] of objA) {
        if (!objB.has(k) || !Object.is(v, objB.get(k))) return false
      }
    }

    return true
  }

  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false

    if (config.mode === 'deep') {
      // Match each element of objA to its own element of objB. A later
      // element may take an earlier one's match if that one can move to
      // another (augmenting paths), so a custom non-transitive `equals`
      // cannot hide a valid matching. Pairs are compared lazily, once.
      const values = [...objA]
      const others = [...objB]
      const indexOfOther = new Map(others.map((other, index) => [other, index]))
      const owner: Array<number> = others.map(() => -1)
      const compared = new Map<number, boolean>()
      const matches = (value: number, index: number): boolean => {
        const key = value * others.length + index
        let result = compared.get(key)
        if (result === undefined) {
          result =
            values[value] === others[index] ||
            _evaluate(values[value], others[index], config, seen)
          compared.set(key, result)
        }
        return result
      }
      const assign = (value: number, visited: Array<boolean>): boolean => {
        for (let index = 0; index < others.length; index++) {
          if (visited[index] || !matches(value, index)) continue
          visited[index] = true
          const current = owner[index] ?? -1
          if (current === -1 || assign(current, visited)) {
            owner[index] = value
            return true
          }
        }
        return false
      }
      for (let value = 0; value < values.length; value++) {
        const same = indexOfOther.get(values[value])
        if (same !== undefined && owner[same] === -1) {
          owner[same] = value
          continue
        }
        if (
          !assign(
            value,
            others.map(() => false),
          )
        )
          return false
      }
    }

    if (config.mode === 'shallow') {
      for (const v of objA) {
        if (!objB.has(v)) return false
      }
    }

    return true
  }

  if (
    objA.constructor === objB.constructor &&
    typeof (objA as { equals?: unknown }).equals === 'function' &&
    typeof (objB as { equals?: unknown }).equals === 'function'
  ) {
    return (objA as unknown as { equals: (other: unknown) => boolean }).equals(
      objB,
    )
  }

  const keysA = getOwnKeys(objA as object)
  const keysB = getOwnKeys(objB as object)

  if (keysA.length !== keysB.length) {
    return false
  }

  if (config.mode === 'deep') {
    for (const key of keysA) {
      if (
        !Object.prototype.hasOwnProperty.call(objB, key) ||
        !_evaluate(objA[key as keyof T], objB[key as keyof T], config, seen)
      ) {
        return false
      }
    }
  }

  if (config.mode === 'shallow') {
    for (const key of keysA) {
      if (
        !Object.prototype.hasOwnProperty.call(objB, key) ||
        !Object.is(objA[key as keyof T], objB[key as keyof T])
      ) {
        return false
      }
    }
  }

  return true
}

function getOwnKeys(obj: object): Array<string | symbol> {
  return (Object.keys(obj) as Array<string | symbol>).concat(
    Object.getOwnPropertySymbols(obj),
  )
}
