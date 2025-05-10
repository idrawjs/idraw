// import { generate32Base36Hash } from './hash';

export function createUUID(): string {
  function _createStr() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return `${_createStr()}${_createStr()}-${_createStr()}-${_createStr()}-${_createStr()}-${_createStr()}${_createStr()}${_createStr()}`;
}

function limitHexStr(str: string, seed: number) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    count += str.charCodeAt(i);
  }
  return (count + seed).toString(16).substring(0, 4);
}

function sumCharCodes(str: string): number {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return sum;
}

export function createAssetId(assetStr: string, elemUUID: string): string {
  const len = assetStr.length;
  const seed = sumCharCodes(elemUUID);

  const mid = Math.floor(len / 2);
  const start4 = assetStr.substring(0, 4).padStart(4, '0');
  const end4 = assetStr.substring(0, 4).padStart(4, '0');
  const str1 = limitHexStr(len.toString(16).padStart(4, start4), seed).padStart(4, '0');
  const str2 = limitHexStr(assetStr.substring(mid - 4, mid).padStart(4, start4), seed).padStart(4, '0');
  const str3 = limitHexStr(assetStr.substring(mid - 8, mid - 4).padStart(4, start4), seed).padStart(4, '0');
  const str4 = limitHexStr(assetStr.substring(mid - 12, mid - 8).padStart(4, start4), seed).padStart(4, '0');
  const str5 = limitHexStr(assetStr.substring(mid - 16, mid - 12).padStart(4, end4), seed).padStart(4, '0');
  const str6 = limitHexStr(assetStr.substring(mid, mid + 4).padStart(4, end4), seed).padStart(4, '0');
  const str7 = limitHexStr(assetStr.substring(mid + 4, mid + 8).padStart(4, end4), seed).padStart(4, '0');
  const str8 = limitHexStr(end4.padStart(4, start4).padStart(4, end4), seed);

  return `@assets/${str1}${str2}-${str3}-${str4}-${str5}-${str6}${str7}${str8}`;
}

export function isAssetId(id: any | string): boolean {
  return /^@assets\/[0-9a-z-]{0,}$/.test(`${id}`);
}
