export function merge<T extends Record<string, any> = any, U extends Record<string, any> = any>(
  target: T,
  source: U
): T & U {
  type Result = T & U;
  const result: Result = target as Result;
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        typeof result[key] === 'object' &&
        result[key] !== null
      ) {
        result[key] = merge(result[key] as object, source[key] as object) as any;
      } else {
        result[key] = source[key] as any;
      }
    }
  }
  return target as T & U;
}
