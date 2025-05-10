import { generate32Base36Hash } from './hash';

export function createUUID(): string {
  function _createStr() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return `${_createStr()}${_createStr()}-${_createStr()}-${_createStr()}-${_createStr()}-${_createStr()}${_createStr()}${_createStr()}`;
}

export function createAssetId(assetStr: string): string {
  return `@assets/${generate32Base36Hash(assetStr)}`;
}

export function isAssetId(id: any | string): boolean {
  return /^@assets\/[0-9a-z-]{0,}$/.test(`${id}`);
}
