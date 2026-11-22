export function compareShallow<T>(objA: T, objB: T): boolean {
  return _evaluate(objA, objB, { mode: 'shallow' }, createSeen())
}

export function compareDeep<T>(objA: T, objB: T): boolean {
  return _evaluate(objA, objB, { mode: 'deep' }, createSeen())
}

// Past this nesting depth, values are reported as unequal instead of recursing
// further, so hostile or accidental deep nesting cannot overflow the stack.
const MAX_DEPTH = 500

const EQUAL = 0
const NOT_EQUAL = -1

// A pair that compared equal while assuming that some in-progress pairs above
// it are equal. It is reused as equal until one of those pairs finishes.
interface Provisional {
  // the shallowest in-progress pair it depends on
  lowest: number
}

// Each compared pair (a, b) has a state: its stack depth (a positive number)
// while it is still being compared, EQUAL or NOT_EQUAL once it is final, or a
// Provisional result.
type PairState = number | Provisional
type PairStates = Map<object, PairState>

interface Seen {
  pairs: Map<object, PairStates>
  // depth of the pair being compared
  depth: number
  // shallowest in-progress pair the current comparison depends on
  lowestAssumed: number
  // incremented whenever a comparison stops at MAX_DEPTH
  depthLimitHits: number
  // provisional pairs, by the depth of the in-progress pair that decides them
  pending: Array<Array<[PairStates, object, Provisional]> | undefined>
}

function createSeen(): Seen {
  return {
    pairs: new Map(),
    depth: 0,
    lowestAssumed: Infinity,
    depthLimitHits: 0,
    pending: [],
  }
}

function addPending(
  seen: Seen,
  depth: number,
  entry: [PairStates, object, Provisional],
) {
  ;(seen.pending[depth] ??= []).push(entry)
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
  // further up the stack is assumed equal, and so is a provisional pair. Either
  // way, the current comparison now depends on the same in-progress pairs.
  if (state !== undefined) {
    const assumed = typeof state === 'number' ? state : state.lowest
    seen.lowestAssumed = Math.min(seen.lowestAssumed, assumed)
    return true
  }

  if (seen.depth >= MAX_DEPTH) {
    seen.depthLimitHits++
    return false
  }

  if (!pairs) {
    pairs = new Map()
    seen.pairs.set(objA, pairs)
  }
  const depth = ++seen.depth
  pairs.set(objB, depth)
  const outerLowestAssumed = seen.lowestAssumed
  const depthLimitHitsBefore = seen.depthLimitHits
  seen.lowestAssumed = Infinity
  let result = false

  try {
    result = _evaluateObjects(objA, objB, config, seen)
    return result
  } finally {
    seen.depth--
    const innerLowestAssumed = seen.lowestAssumed
    const assumedAbove = innerLowestAssumed < depth

    // Provisional pairs below this one wait here until it finishes, because
    // they may have assumed it is equal. If it fails, they are dropped. If it
    // succeeds, they are final once every pair they assumed has finished, and
    // otherwise they wait for the next pair up.
    const dependents = seen.pending[depth]
    seen.pending[depth] = undefined
    if (dependents) {
      for (const entry of dependents) {
        const [states, b, provisional] = entry
        if (!result) states.delete(b)
        else if (provisional.lowest >= depth) states.set(b, EQUAL)
        else addPending(seen, depth - 1, entry)
      }
    }

    if (!result) {
      // A failure is final only if it assumed nothing above this pair and did
      // not stop at MAX_DEPTH. An assumption can make Set matching pick the
      // wrong candidate, and the same pair may fit within MAX_DEPTH elsewhere.
      if (!assumedAbove && seen.depthLimitHits === depthLimitHitsBefore) {
        pairs.set(objB, NOT_EQUAL)
      } else {
        pairs.delete(objB)
      }
    } else if (!assumedAbove) {
      pairs.set(objB, EQUAL)
    } else {
      const provisional: Provisional = { lowest: innerLowestAssumed }
      pairs.set(objB, provisional)
      addPending(seen, depth - 1, [pairs, objB, provisional])
    }

    // assumptions about pairs above this one still apply to them
    seen.lowestAssumed = Math.min(
      outerLowestAssumed,
      assumedAbove ? innerLowestAssumed : Infinity,
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
      const remaining = new Set(objB)
      for (const v of objA) {
        if (remaining.delete(v)) continue
        let match: unknown
        let found = false
        for (const other of remaining) {
          if (_evaluate(v, other, config, seen)) {
            match = other
            found = true
            break
          }
        }
        if (!found) return false
        remaining.delete(match)
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
