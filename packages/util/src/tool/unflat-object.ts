type NestedStructure = object | unknown[];

/**
 * Restores a flattened object to its original nested structure
 * @param flatObj Flattened object (e.g., { 'a.b.c': 1, 'a.d[0]': 2 })
 * @returns Nested object structure (e.g., { a: { b: { c: 1 }, d: [2] } })
 */
export function unflatObject<T extends Record<string, unknown>>(flatObj: T): NestedStructure {
  const result: NestedStructure = {};

  for (const [flatKey, value] of Object.entries(flatObj)) {
    const pathParts = parseKeyToPath(flatKey);
    buildNestedStructure(result, pathParts, value);
  }

  return result;
}

/**
 * Improved path parser with better array handling
 * @example 'a.b[0].c' => ['a', 'b', '0', 'c']
 */
function parseKeyToPath(flatKey: string): string[] {
  const regex = /([\w-]+)|\[(\d+)\]/g;
  const pathParts: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(flatKey)) !== null) {
    const prop = match[1] || match[2];
    if (prop) {
      pathParts.push(prop);
    }
  }

  return pathParts;
}

/**
 * Enhanced structure builder with array fixes
 */
function buildNestedStructure(currentObj: NestedStructure, pathParts: string[], value: unknown): void {
  let currentLevel: any = currentObj;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    const isArrayPart = isArrayIndex(part);
    const isLast = i === pathParts.length - 1;

    try {
      if (isArrayPart) {
        validateArrayPath(currentLevel, part);
      } else {
        validateObjectPath(currentLevel, part);
      }
    } catch (e: any) {
      throw new Error(`Structure conflict at path '${pathParts.slice(0, i + 1).join('.')}': ${e.message}`);
    }

    if (isLast) {
      assignValue(currentLevel, part, value);
    } else {
      currentLevel = prepareNextLevel(currentLevel, part, pathParts[i + 1]);
    }
  }
}

// Utility functions ===============================================

function isArrayIndex(key: string): boolean {
  return /^\d+$/.test(key);
}

function validateArrayPath(obj: any, index: string): void {
  if (!Array.isArray(obj)) {
    throw new Error(`Expected array but found ${typeof obj}`);
  }

  const idx = Number(index);
  if (idx > obj.length) {
    obj.length = idx + 1;
  }
}

function validateObjectPath(obj: any, key: string): void {
  if (Array.isArray(obj)) {
    throw new Error(`Cannot create object property '${key}' on array`);
  }

  if (typeof obj !== 'object' || obj === null) {
    throw new Error(`Invalid structure for property '${key}'`);
  }
}

function prepareNextLevel(current: any, part: string, nextPart?: string): any {
  const isNextArray = nextPart ? isArrayIndex(nextPart) : false;

  if (Array.isArray(current)) {
    const index = Number(part);
    if (!current[index]) {
      current[index] = isNextArray ? [] : {};
    }
    return current[index];
  }

  if (!current[part]) {
    current[part] = isNextArray ? [] : {};
  }
  return current[part];
}

function assignValue(target: any, key: string, value: unknown): void {
  if (Array.isArray(target)) {
    const index = Number(key);
    if (index >= target.length) {
      target.length = index + 1;
    }
    target[index] = value;
  } else {
    target[key] = value;
  }
}
