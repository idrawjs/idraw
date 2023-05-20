export const PREFIX = 'idraw-studio';

export function createPrefixName(modName: string) {
  return (...args: string[]) => {
    return [PREFIX, modName, ...args].join('-');
  };
}
