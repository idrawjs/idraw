import type { Element } from '@idraw/types';
import { nodeToElementBase, nodeToBaseDetail, hasFillImage } from './base';
import { figmaColorToHex, figmaPaintsToColor } from './color';
import { textNodeToTextElement } from './text';
import { nodeToImageElement } from './image';
import { roundedRectangleNodeToRectElement } from './rectangle';
import { ellipseNodeToCircleElement } from './ellipse';
import { regularPolygonNodeToPathElement } from './regular-polygon';
import { lineNodeToPathElement } from './line';
import { starNodeToPathElement } from './star';
import { vectorNodeToPathElement } from './vector';
import { getOverrideNodeMap, mergeNodeOverrideData } from '../common/node';
import { nodeToOperations } from './operations';

import type { FigmaGUID, FigmaNode, FigmaNodeType, FigmaParseOptions, FigmaSymbolOverrideItem, FigmaInstanceNode } from '../types';
import { figmaGUIDToID } from '../common/node';
import { resetGroupSize } from '../common/calc';

async function instanceNodeToGroupElement(figmaNode: FigmaNode<'INSTANCE'>, opts: FigmaParseOptions<'INSTANCE'>): Promise<Element<'group'>> {
  const { backupNodeMap } = opts;
  const overrideData = mergeNodeOverrideData<'INSTANCE'>(figmaNode, opts);
  const node = { ...figmaNode, ...overrideData };
  const { derivedSymbolData } = node;
  const elemBase = nodeToElementBase(node);
  const elem: Element<'group'> = {
    ...elemBase,
    type: 'group',
    detail: {
      children: []
    }
  };
  const operations: Required<Element<'group'>>['operations'] = nodeToOperations(node);
  const detail: Partial<Element<'group'>['detail']> = nodeToBaseDetail(node);
  elem.detail = {
    ...elem.detail,
    ...detail
  };

  if (Array.isArray(derivedSymbolData)) {
    for (let i = 0; i < derivedSymbolData.length; i++) {
      const item = derivedSymbolData[i];
      const { guidPath, ...restProperties } = item;
      // const { fillGeometry, strokeGeometry,  } = item as Partial<FigmaNode<'VECTOR'>>;

      let copyNode: FigmaNode | undefined = undefined;
      if (Array.isArray(item.guidPath.guids) && item.guidPath.guids.length > 0) {
        // TODO
        const id = figmaGUIDToID(item.guidPath.guids[0]);
        copyNode = backupNodeMap[id];
      }

      if (copyNode) {
        const childNode = { ...copyNode, ...restProperties };
        const chidElem = await figmaNodeToElement(childNode, opts);
        elem.detail.children.push(chidElem as Element);
      }

      // const baseSize: ElementSize = {
      //   x: 0, // TODO
      //   y: 0, // TODO
      //   w: elemBase.w,
      //   h: elemBase.h
      // };
      // if (restProperties.size) {
      //   baseSize.w = restProperties.size.x;
      //   baseSize.h = restProperties.size.y;
      // }
    }
  }

  elem.operations = operations;

  return elem;
}

async function nestedNodeToGroupElement<T extends 'CANVAS' | 'FRAME' | 'SYMBOL' | 'BOOLEAN_OPERATION' = 'CANVAS'>(
  figmaNode: FigmaNode<'CANVAS'> | FigmaNode<'FRAME'> | FigmaNode<'SYMBOL'> | FigmaNode<'BOOLEAN_OPERATION'>,
  opts: FigmaParseOptions<T>
): Promise<Element<'group'>> {
  const overrideData = mergeNodeOverrideData<T>(figmaNode as any, opts);
  const node: FigmaNode = { ...figmaNode, ...overrideData } as FigmaNode;
  const elemBase = nodeToElementBase(node);
  const baseDetail = nodeToBaseDetail(node);

  let group: Element<'group'> = {
    ...elemBase,
    type: 'group',
    detail: {
      ...baseDetail,
      children: [],
      overflow: 'visible'
    },
    operations: nodeToOperations(node)
  };
  if ((node as unknown as FigmaNode<'FRAME'>).type === 'FRAME') {
    // const background = figmaPaintsToHexColor(node.fillPaints);
    const background = figmaPaintsToColor(node.fillPaints, { w: elemBase.w, h: elemBase.h });

    if (background) {
      group.detail.background = background;
    }
  }

  if (node.backgroundColor) {
    if (!group.global) {
      group.global = {};
    }
    group.global.background = figmaColorToHex(node.backgroundColor);
  }

  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const elem: Element = (await figmaNodeToElement(child, opts as FigmaParseOptions)) as Element;
      group.detail.children.push(elem);
    }

    group.detail.children.reverse();
  }

  if (['FRAME', 'BOOLEAN_OPERATION'].includes(node.type)) {
    if (group.w === 0 || group.h === 0) {
      const size = resetGroupSize(group);
      group = {
        ...size,
        ...group
      };
    }
  }

  if ((node as unknown as FigmaNode<'FRAME'>).type === 'FRAME') {
    const figmaNode = node as unknown as FigmaNode<'FRAME'>;
    if (figmaNode.frameMaskDisabled === true) {
      group.detail.overflow = 'visible';
    } else {
      group.detail.overflow = 'hidden';
    }
  }

  return group;
}

async function canvasNodeToGroupElement(node: FigmaNode<'CANVAS'>, opts: FigmaParseOptions): Promise<Element<'group'>> {
  return await nestedNodeToGroupElement(node, opts);
}

async function booleanOperationNodeToGroupElement(
  node: FigmaNode<'BOOLEAN_OPERATION'>,
  opts: FigmaParseOptions<'BOOLEAN_OPERATION'>
): Promise<Element<'group' | 'path'>> {
  const { overrideNodeMap = {} } = opts;
  const overrideProperties: FigmaNode = {} as FigmaNode;
  const { fillPaints, strokePaints, fillGeometry, strokeGeometry } = node;

  let useFillGeometry = false;
  if (Array.isArray(fillPaints) && fillPaints.length > 0 && Array.isArray(fillGeometry) && fillGeometry.length > 0) {
    useFillGeometry = fillPaints.findIndex((p) => p.visible === true) >= 0;
  }

  let useStrokeGeometry = false;
  if (Array.isArray(strokePaints) && strokePaints.length > 0 && Array.isArray(strokeGeometry) && strokeGeometry.length > 0) {
    useStrokeGeometry = strokePaints.findIndex((p) => p.visible === true) >= 0;
  }

  if (useFillGeometry === true || useStrokeGeometry === true) {
    return await vectorNodeToPathElement(node as unknown as FigmaNode<'VECTOR'>, opts as FigmaParseOptions<'VECTOR'>);
  }

  if (Array.isArray(fillPaints) && fillPaints.length > 0) {
    overrideProperties.fillPaints = fillPaints;
  }
  if (Array.isArray(strokePaints) && strokePaints.length > 0) {
    overrideProperties.strokePaints = strokePaints;
  }

  return await nestedNodeToGroupElement<any>({ ...node, ...overrideNodeMap[figmaGUIDToID(node.guid)] }, {
    ...opts,
    ...{ overrideProperties: overrideProperties as any }
  } as FigmaParseOptions<any>);
}

async function frameNodeToGroupElement(node: FigmaNode<'FRAME'>, opts: FigmaParseOptions<'FRAME'>): Promise<Element<'group'>> {
  return await nestedNodeToGroupElement(node, opts);
}

async function symbolNodeToGroupElement(node: FigmaNode<'SYMBOL'>, opts: FigmaParseOptions<'SYMBOL'>): Promise<Element<'group'>> {
  return await nestedNodeToGroupElement(node, opts);
}

async function instanceNodeToElement(node: FigmaNode<'INSTANCE'>, opts: FigmaParseOptions<'INSTANCE'>): Promise<Element | null> {
  const { instanceNodeMap, overrideProperties } = opts;
  const overrideNodeMap = {
    ...opts.overrideNodeMap,
    ...getOverrideNodeMap(node)
  };
  const symbolID = figmaGUIDToID(node.symbolData.symbolID);
  let symbolNode = instanceNodeMap[symbolID];

  let newOverrideProperties: Partial<FigmaInstanceNode> = {
    ...overrideProperties
  };

  if (symbolNode) {
    symbolNode = {
      ...symbolNode,
      ...{
        visible: node.visible
      }
    };
    const elemSize = nodeToElementBase(node);
    const overrideData = mergeNodeOverrideData<'INSTANCE'>(node, opts);

    // console.log(' -------------- node -------------- ', node.name, figmaGUIDToID(node.guid), symbolID);
    // console.log('node =', node);
    // console.log('overrideProperties =', overrideProperties);
    // console.log('symbolNode = ', symbolNode);
    // console.log('instanceNodeMap =', instanceNodeMap);
    // console.log('overrideNodeMap =', overrideNodeMap);
    // console.log('overrideData =======', node.overrideKey, overrideData);

    if ((overrideData as FigmaSymbolOverrideItem).overriddenSymbolID) {
      const overriddenSymbolID = figmaGUIDToID((overrideData as FigmaSymbolOverrideItem).overriddenSymbolID as FigmaGUID);

      if (instanceNodeMap[overriddenSymbolID]) {
        const overriddenSymbolNode = instanceNodeMap[overriddenSymbolID];
        symbolNode = {
          ...symbolNode,
          ...overriddenSymbolNode
        };
      }
    } else {
      // TODO
      const { textData } = overrideData as Partial<FigmaNode<'TEXT'>>;
      if (textData) {
        (newOverrideProperties as unknown as FigmaNode<'TEXT'>).textData = textData;
      }
    }

    const elem = await figmaNodeToElement(symbolNode, {
      ...opts,
      ...{ overrideNodeMap, overrideProperties: newOverrideProperties as Record<string, Partial<FigmaInstanceNode>> }
    });
    if (elem) {
      return {
        ...elem,
        ...elemSize
      };
    }
    return elem;
  }
  return await instanceNodeToGroupElement(node, opts as FigmaParseOptions<'INSTANCE'>);
}

export async function figmaNodeToElement(node: FigmaNode<FigmaNodeType>, opts: FigmaParseOptions<FigmaNodeType>): Promise<Element | null> {
  if (node.type === 'CANVAS') {
    let elem: Element<'group'> = await canvasNodeToGroupElement(node as FigmaNode<'CANVAS'>, opts as FigmaParseOptions<'CANVAS'>);
    return elem;
  } else if (node.type === 'FRAME') {
    const elem: Element<'group'> = await frameNodeToGroupElement(node as FigmaNode<'FRAME'>, opts as FigmaParseOptions<'FRAME'>);
    return elem;
  } else if (node.type === 'SYMBOL') {
    const elem: Element<'group'> = await symbolNodeToGroupElement(node as FigmaNode<'SYMBOL'>, opts as FigmaParseOptions<'SYMBOL'>);
    return elem;
  } else if (hasFillImage(node as unknown as FigmaNode)) {
    const elem: Element<'image'> = await nodeToImageElement(node as unknown as FigmaNode, opts as FigmaParseOptions);
    return elem;
  } else if (node.type === 'ROUNDED_RECTANGLE') {
    const elem: Element<'rect'> = roundedRectangleNodeToRectElement(node as FigmaNode<'ROUNDED_RECTANGLE'>, opts as FigmaParseOptions<'ROUNDED_RECTANGLE'>);
    return elem;
  } else if (node.type === 'ELLIPSE') {
    const elem: Element<'circle'> = ellipseNodeToCircleElement(node as FigmaNode<'ELLIPSE'>, opts as FigmaParseOptions<'ELLIPSE'>);
    return elem;
  } else if (node.type === 'TEXT') {
    const elem: Element<'text'> = textNodeToTextElement(node as FigmaNode<'TEXT'>, opts as FigmaParseOptions<'TEXT'>);
    return elem;
  } else if (node.type === 'REGULAR_POLYGON') {
    const elem: Element<'path'> = regularPolygonNodeToPathElement(node as FigmaNode<'REGULAR_POLYGON'>, opts as FigmaParseOptions<'REGULAR_POLYGON'>);
    return elem;
  } else if (node.type === 'LINE') {
    const elem: Element<'path'> = lineNodeToPathElement(node as FigmaNode<'LINE'>, opts as FigmaParseOptions<'LINE'>);
    return elem;
  } else if (node.type === 'STAR') {
    const elem: Element<'path'> = starNodeToPathElement(node as FigmaNode<'STAR'>, opts as FigmaParseOptions<'STAR'>);
    return elem;
  } else if (node.type === 'VECTOR') {
    const elem: Element<'path'> = vectorNodeToPathElement(node as FigmaNode<'VECTOR'>, opts as FigmaParseOptions<'VECTOR'>);
    return elem;
  } else if (node.type === 'INSTANCE') {
    const elem: Element | null = await instanceNodeToElement(node as FigmaNode<'INSTANCE'>, opts as FigmaParseOptions<'INSTANCE'>);
    return elem;
  } else if (node.type === 'BOOLEAN_OPERATION') {
    const elem: Element | null = await booleanOperationNodeToGroupElement(
      node as FigmaNode<'BOOLEAN_OPERATION'>,
      opts as FigmaParseOptions<'BOOLEAN_OPERATION'>
    );
    return elem;
  }

  return null;
}
