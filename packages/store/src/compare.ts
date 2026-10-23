export function compareShallow<T>(objA: T, objB: T): boolean {
  return _evaluate(objA, objB, { mode: 'shallow' }, new WeakMap())
}

export function compareDeep<T>(objA: T, objB: T): boolean {
  return _evaluate(objA, objB, { mode: 'deep' }, new WeakMap())
}

function _evaluate<T>(
  objA: T,
  objB: T,
  config: { mode: 'shallow' | 'deep' },
  seen: WeakMap<object, WeakSet<object>>,
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

  // guards against circular references: a pair that is still being compared
  // further up the stack is assumed equal. The pair is released afterwards so
  // a failed comparison (e.g. while matching Set elements) is not remembered
  // as a success.
  let seenB = seen.get(objA as object)

  if (seenB?.has(objB as object)) return true

  if (!seenB) {
    seenB = new WeakSet()
    seen.set(objA as object, seenB)
  }

  seenB.add(objB as object)

  try {
    return _evaluateObjects(objA, objB, config, seen)
  } finally {
    seenB.delete(objB as object)
  }
}

function _evaluateObjects<T>(
  objA: T & object,
  objB: T & object,
  config: { mode: 'shallow' | 'deep' },
  seen: WeakMap<object, WeakSet<object>>,
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
      // each element of objB may only be matched once
      const unmatched = [...objB]
      for (const v of objA) {
        let index = unmatched.indexOf(v)
        if (index === -1) {
          index = unmatched.findIndex((bv) => _evaluate(v, bv, config, seen))
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
