export function createUUID(): string {
  function _createStr() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return `${_createStr()}${_createStr()}-${_createStr()}-${_createStr()}-${_createStr()}-${_createStr()}${_createStr()}${_createStr()}`;
}

function limitHexStr(str: string) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    count += str.charCodeAt(i) * str.charCodeAt(i) * i * i;
  }
  return count.toString(16).substring(0, 4);
}

export function createAssetId(assetStr: string): string {
  const len = assetStr.length;
  const mid = Math.floor(len / 2);
  const start4 = assetStr.substring(0, 4).padEnd(4, '0');
  const end4 = assetStr.substring(0, 4).padEnd(4, '0');
  const str1 = limitHexStr(len.toString(16).padEnd(4, start4));
  const str2 = limitHexStr(assetStr.substring(mid - 4, mid).padEnd(4, start4)).padEnd(4, 'f');
  const str3 = limitHexStr(assetStr.substring(mid - 8, mid - 4).padEnd(4, start4)).padEnd(4, 'f');
  const str4 = limitHexStr(assetStr.substring(mid - 12, mid - 8).padEnd(4, start4)).padEnd(4, 'f');
  const str5 = limitHexStr(assetStr.substring(mid - 16, mid - 12).padEnd(4, end4)).padEnd(4, 'f');
  const str6 = limitHexStr(assetStr.substring(mid, mid + 4).padEnd(4, end4)).padEnd(4, 'f');
  const str7 = limitHexStr(assetStr.substring(mid + 4, mid + 8).padEnd(4, end4)).padEnd(4, 'f');
  const str8 = limitHexStr(end4.padEnd(4, start4).padEnd(4, end4));
  return `@assets/${str1}${str2}-${str3}-${str4}-${str5}-${str6}${str7}${str8}`;
}

export function isAssetId(id: any | string): boolean {
  return /^@assets\/[0-9a-z]{8,8}\-[0-9a-z]{4,4}\-[0-9a-z]{4,4}\-[0-9a-z]{4,4}\-[0-9a-z]{12,12}$/.test(`${id}`);
}
