export function createUUID(): string {
  function str4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return `${str4()}${str4()}-${str4()}-${str4()}-${str4()}-${str4()}${str4()}${str4()}`;
}