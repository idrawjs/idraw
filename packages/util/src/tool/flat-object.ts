type FlattenedObject = Record<string, any>;

type FlatObjectOptions = {
  ignorePaths?: string[]; // eg. ["detail.children"]
};

/**
 * Flattens a nested object/array into a path-based object
 * @param obj The input object
 * @param parentKey The parent path (used internally for recursion)
 * @param result The result object (used internally for recursion)
 */
function flattenObject<T extends Record<string, any>>(
  obj: T,
  parentKey: string = '',
  result: FlattenedObject = {},
  opts?: FlatObjectOptions
): FlattenedObject {
  // Iterate over each key in the object
  Object.keys(obj).forEach((key) => {
    // Compute the current full path
    const currentKey = parentKey ? `${parentKey}${isArrayIndex(key) ? `[${key}]` : `.${key}`}` : key;
    if (!opts?.ignorePaths?.includes(currentKey)) {
      // Get the current value
      const value = obj[key];

      // Handle flattenable types (objects/arrays)
      if (isFlattenable(value)) {
        flattenObject(value, Array.isArray(value) ? currentKey : currentKey, result, opts);
      }
      // Handle primitive values that cannot be flattened further
      else {
        result[currentKey] = value;
      }
    }
  });

  return result;
}

// Type guard to check if the value can be flattened
function isFlattenable(value: unknown): value is object | Array<unknown> {
  return (typeof value === 'object' && value !== null && !(value instanceof Date)) || Array.isArray(value);
}

// Check if the key is an array index (for path formatting)
function isArrayIndex(key: string): boolean {
  return /^\d+$/.test(key) && !isNaN(Number(key));
}

// Main entry function to flatten an object with enhanced type support
export function flatObject<T extends Record<string, any>>(obj: T, opts?: FlatObjectOptions): FlattenedObject {
  // Defensive check for non-object input
  if (typeof obj !== 'object' || obj === null) {
    return { '': obj };
  }

  return flattenObject(obj, '', {}, opts);
}
