import type { FigmaGUID, FigmaNode, FigmaNodeType, FigmaParseOptions, FigmaSymbolOverrideItem } from '../types';

export function figmaGUIDToID(guid: FigmaGUID): string {
  return `${guid.sessionID}:${guid.localID}`;
}

export function getOverrideNodeMap(node: FigmaNode<'INSTANCE'>): Record<string, Partial<FigmaNode>> {
  const overrideNodeMap: Record<string, Partial<FigmaNode>> = {};
  const { symbolData, derivedSymbolData } = node;
  const { symbolOverrides } = symbolData;
  if (Array.isArray(symbolOverrides) && symbolOverrides.length > 0) {
    symbolOverrides.forEach((item) => {
      const { guidPath, ...restData } = item;
      guidPath.guids.forEach((guid) => {
        const id = figmaGUIDToID(guid);
        if (overrideNodeMap[id]) {
          overrideNodeMap[id] = { ...overrideNodeMap[id], ...restData };
        } else {
          overrideNodeMap[id] = restData;
        }
      });
    });
  }

  if (Array.isArray(derivedSymbolData) && derivedSymbolData.length > 0) {
    derivedSymbolData.forEach((item) => {
      const { guidPath, ...restData } = item;
      guidPath.guids.forEach((guid) => {
        const id = figmaGUIDToID(guid);
        if (overrideNodeMap[id]) {
          overrideNodeMap[id] = { ...overrideNodeMap[id], ...restData };
        } else {
          overrideNodeMap[id] = restData;
        }
      });
    });
  }

  return overrideNodeMap;
}

export function mergeNodeOverrideData<T extends FigmaNodeType = 'CANVAS'>(
  node: FigmaNode<T>,
  opts: FigmaParseOptions<T>
): Partial<FigmaNode<T>> | FigmaSymbolOverrideItem {
  let overrideData: Partial<FigmaNode<T>> = {};

  const { overrideNodeMap = {}, overrideProperties } = opts;
  const { overrideKey } = node;

  if (overrideKey) {
    const overrideId = figmaGUIDToID(overrideKey);
    if (overrideNodeMap[overrideId]) {
      overrideData = { ...overrideData, ...overrideNodeMap[overrideId] } as Partial<FigmaNode<T>>;
    }
  }
  if (overrideProperties) {
    overrideData = { ...overrideData, ...overrideProperties };
  }

  return overrideData;
}

export async function uint8ArrayToBase64(u8: Uint8Array, opts: { type: string }): Promise<string> {
  const { type } = opts;
  return new Promise((resolve, reject) => {
    var blob = new Blob([u8], { type });
    var fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      resolve(fileReader.result as string);
    });
    fileReader.addEventListener('error', (err) => {
      reject(err);
    });
    fileReader.readAsDataURL(blob);
  });
}
