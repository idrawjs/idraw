export const PREFIX = 'idraw-design';

export function createPrefixName(modName: string) {
  return (...args: string[]) => {
    return [PREFIX, modName, ...args].join('-');
  };
}
