/**
 * Convert path to array format
 * @example 'a[0].b.c' => ['a', '0', 'b', 'c']
 */
export function toPath(path: string | string[]): string[] {
  if (Array.isArray(path)) return [...path];
  return path.split(/\.|\[|\]/).filter((key) => key !== '');
}

/**
 * Lodash-style get method to retrieve nested object values
 * @param obj Target object
 * @param path Path string or array
 * @param defaultValue Fallback value if path not found
 */
export function get<T = any, D = any>(obj: T, path: string | string[], defaultValue?: D): D | undefined {
  if (!path) {
    return undefined;
  }
  const pathArray = toPath(path);
  let current: any = obj;

  for (const key of pathArray) {
    if (current === null || current === undefined) {
      return defaultValue as D;
    }
    current = current[key];
  }

  return current !== undefined ? current : defaultValue;
}

/**
 * Lodash-style set method to assign values to nested paths (mutates original object)
 * @param obj Target object
 * @param path Path string or array
 * @param value Value to assign
 */
export function set<T = any>(obj: T, path: string | string[], value: any): T {
  const pathArray = toPath(path);
  if (pathArray.length === 0) {
    return obj;
  }

  let current: any = obj;

  if (current) {
    for (let i = 0; i < pathArray.length; i++) {
      const key = pathArray[i];

      if (i === pathArray.length - 1) {
        // Final path segment - assign value
        current[key] = value;
        break;
      }

      // Create missing path structures
      if (current && (current?.[key] === undefined || typeof current?.[key] !== 'object' || current?.[key] === null)) {
        const nextKey = pathArray[i + 1];
        const isNextNumeric = /^\d+$/.test(nextKey);
        current[key] = isNextNumeric ? [] : {};
      }

      current = current?.[key];
    }
  }

  return obj;
}

export function del<T = any>(obj: T, path: string | string[]): T {
  const pathArray = toPath(path);
  if (pathArray.length === 0) {
    return obj;
  }

  let current: any = obj;

  if (current) {
    for (let i = 0; i < pathArray.length; i++) {
      const key = pathArray[i];

      if (i === pathArray.length - 1) {
        // Final path segment - delete value
        delete current[key];
        break;
      }

      // Create missing path structures
      if (current && (current?.[key] === undefined || typeof current?.[key] !== 'object' || current?.[key] === null)) {
        const nextKey = pathArray[i + 1];
        const isNextNumeric = /^\d+$/.test(nextKey);
        current[key] = isNextNumeric ? [] : {};
      }

      current = current?.[key];
    }
  }

  return obj;
}
