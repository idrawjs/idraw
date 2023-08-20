export const PREFIX = 'idraw-lab';

export function createPrefixName(modName: string) {
  return (...args: string[]) => {
    return [PREFIX, modName, ...args].join('-');
  };
}
