export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  // Create a shallow copy of the object
  const result = { ...obj };

  // Remove the specified keys
  for (const key of keys) {
    delete result[key];
  }

  return result;
}
