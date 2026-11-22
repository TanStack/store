export function compareShallow<T>(objA: T, objB: T): boolean {
  return _evaluate(objA, objB, { mode: 'shallow' }, createSeen())
}

export function compareDeep<T>(objA: T, objB: T): boolean {
  return _evaluate(objA, objB, { mode: 'deep' }, createSeen())
}

// Each compared pair (a, b) has a state:
// - a positive number: the pair's stack depth while it is still being compared
// - EQUAL or NOT_EQUAL: the pair's final result
// - provisional(d), a number below NOT_EQUAL: the pair is equal as long as the
//   in-progress pair at depth d turns out equal
const EQUAL = 0
const NOT_EQUAL = -1
const provisional = (depth: number) => -depth - 1

// Past this nesting depth, values are reported as unequal instead of recursing
// further, so hostile or accidental deep nesting cannot overflow the stack.
const MAX_DEPTH = 500

type PairStates = Map<object, number>

interface Seen {
  pairs: Map<object, PairStates>
  // depth of the pair being compared
  depth: number
  // shallowest in-progress pair the current comparison depends on
  lowestAssumed: number
  // provisional pairs, by the depth of the in-progress pair they depend on
  pending: Array<Array<[PairStates, object]> | undefined>
}

function createSeen(): Seen {
  return {
    pairs: new Map(),
    depth: 0,
    lowestAssumed: Infinity,
    pending: [],
  }
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

  let pairs = seen.pairs.get(objA)
  const state = pairs?.get(objB)
  if (state === EQUAL) return true
  if (state === NOT_EQUAL) return false

  // guards against circular references: a pair that is still being compared
  // further up the stack is assumed equal, and so is a provisional pair that
  // depends on one. Either way, the current comparison now depends on that
  // in-progress pair too.
  if (state !== undefined) {
    const assumedDepth = state > 0 ? state : -state - 1
    seen.lowestAssumed = Math.min(seen.lowestAssumed, assumedDepth)
    return true
  }

  if (seen.depth >= MAX_DEPTH) return false

  if (!pairs) {
    pairs = new Map()
    seen.pairs.set(objA, pairs)
  }
  const depth = ++seen.depth
  pairs.set(objB, depth)
  const outerLowestAssumed = seen.lowestAssumed
  seen.lowestAssumed = Infinity
  let result = false

  try {
    result = _evaluateObjects(objA, objB, config, seen)
    return result
  } finally {
    seen.depth--
    const innerLowestAssumed = seen.lowestAssumed
    // pairs that were provisionally equal on the assumption that this pair is
    const dependents = seen.pending[depth]
    seen.pending[depth] = undefined

    if (!result) {
      // a pair that fails even while every in-progress pair is assumed equal
      // is unequal, so the result is safe to reuse. Pairs that assumed this
      // one was equal are dropped and will be compared again if needed.
      pairs.set(objB, NOT_EQUAL)
      if (dependents) {
        for (const [states, b] of dependents) states.delete(b)
      }
    } else if (innerLowestAssumed >= depth) {
      // proven without assuming anything above this pair
      pairs.set(objB, EQUAL)
      if (dependents) {
        for (const [states, b] of dependents) states.set(b, EQUAL)
      }
    } else {
      // equal as long as the pair at innerLowestAssumed is, so keep it
      // provisionally instead of comparing it again
      const value = provisional(innerLowestAssumed)
      const list = (seen.pending[innerLowestAssumed] ??= [])
      pairs.set(objB, value)
      list.push([pairs, objB])
      if (dependents) {
        for (const entry of dependents) {
          entry[0].set(entry[1], value)
          list.push(entry)
        }
      }
    }

    // assumptions about pairs above this one still apply to them
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
      // Match each element of objA to its own element of objB, preferring the
      // same reference. Taking the first deep-equal match is enough because
      // deep equality is transitive.
      const unmatched = [...objB]
      for (const v of objA) {
        let index = unmatched.indexOf(v)
        if (index === -1) {
          index = unmatched.findIndex((other) =>
            _evaluate(v, other, config, seen),
          )
        }
        if (index === -1) return false
        unmatched.splice(index, 1)
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
