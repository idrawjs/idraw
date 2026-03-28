const id = () => Math.random().toString(36).substring(2);

export function createId() {
  return `${id()}${id()}`.substring(0, 16);
}
