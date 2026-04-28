export function evaluate<T>(
  objA: T,
  objB: T,
  config: { mode: 'shallow' | 'deep' } = { mode: 'shallow' },
) {
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
        if (!objB.has(k) || !evaluate(v, objB.get(k), config)) return false
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
      for (const v of objA) {
        if (![...objB].some((bv) => evaluate(v, bv, config))) return false
      }
    }

    if (config.mode === 'shallow') {
      for (const v of objA) {
        if (!objB.has(v)) return false
      }
    }

    return true
  }

  if (Object.getPrototypeOf(objA) !== Object.getPrototypeOf(objB)) {
    return false
  }

  const keysA = Object.keys(objA as object)
  const keysB = Object.keys(objB as object)

  if (keysA.length !== keysB.length) {
    return false
  }

  if (config.mode === 'deep') {
    for (const key of keysA) {
      if (
        !keysB.includes(key) ||
        !evaluate(objA[key as keyof T], objB[key as keyof T], config)
      ) {
        return false
      }
    }
  }

  if (config.mode === 'shallow') {
    for (const key of keysA) {
      if (
        !keysB.includes(key) ||
        !Object.is(objA[key as keyof T], objB[key as keyof T])
      ) {
        return false
      }
    }
  }

  return true
}
