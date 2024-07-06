import { parse as parseZIP } from 'uzip';
import type { Data, Element } from '@idraw/types';
import { parseCanvasFigBytes } from './parser';
import type { FigmaMap, FigmaParseOptions } from '../types';
import { figmaNodeToElement } from '../figma-node/node';
import { figmaGUIDToID } from '../common/node';
import { resetGroupSize } from '../common/calc';

const canvasFileName = 'canvas.fig';
const metaFileName = 'meta.json';

export async function figmaBytesToMap(bytes: Uint8Array): Promise<FigmaMap> {
  const unzipped = parseZIP(bytes);

  const fileKeys = Object.keys(unzipped);
  const map: Partial<FigmaMap> = {}; // TODO

  for (let i = 0; i < fileKeys.length; i++) {
    const fileKey = fileKeys[i];
    if (fileKey === canvasFileName) {
      const canvasFig = unzipped[canvasFileName] as Uint8Array;
      const canvasResult: FigmaMap['canvas.fig'] = parseCanvasFigBytes({ bytes: canvasFig });
      map[fileKey] = canvasResult;
    } else if (fileKey === metaFileName) {
      const metaJSON = unzipped[metaFileName] as Uint8Array;
      const metaResult = JSON.parse(new TextDecoder().decode(metaJSON));
      map[fileKey] = metaResult;
    } else {
      map[fileKey] = unzipped[fileKey];
    }
  }

  return map as FigmaMap;
}

function figmaMapToParseOptions(figmaMap: FigmaMap): FigmaParseOptions {
  const instanceNodeMap: FigmaParseOptions['instanceNodeMap'] = {};
  const canvasFig = figmaMap['canvas.fig'];
  const { root, backupNodeMap } = canvasFig;
  if (Array.isArray(root.children)) {
    root.children.forEach((child) => {
      if (child?.type === 'CANVAS' && child.internalOnly === true && Array.isArray(child.children)) {
        child.children.forEach((item) => {
          const id = figmaGUIDToID(item.guid);
          instanceNodeMap[id] = item;
        });
      }
    });
  }

  const opts: FigmaParseOptions = {
    figmaMap,
    instanceNodeMap,
    backupNodeMap
  };

  return opts;
}

export async function figmaMapToIDrawData(figmaMap: FigmaMap): Promise<Data> {
  const data: Data = { elements: [] };
  const canvasFig: FigmaMap['canvas.fig'] = figmaMap['canvas.fig'];
  const { root } = canvasFig;

  // TODO
  console.log('root =', root);

  if (Array.isArray(root.children)) {
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i];
      if (child.internalOnly === true) {
        continue;
      }
      const elem: Element = (await figmaNodeToElement(child, figmaMapToParseOptions(figmaMap))) as Element;
      if (elem.type === 'group' && (elem.w === 0 || elem.h === 0)) {
        resetGroupSize(elem as Element<'group'>);
      }
      data.elements.push(elem);
    }
  }
  return data;
}

export async function figmaBytesToIDrawData(bytes: Uint8Array): Promise<Data> {
  const figmaMap = await figmaBytesToMap(bytes);
  const data = await figmaMapToIDrawData(figmaMap);
  return data;
}
