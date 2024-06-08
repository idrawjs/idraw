import type { Element } from '@idraw/types';
import { nodeToElementBase, getFillColor, getFillPathCommands } from './base';
import { nodeToOperations } from './operations';
import { mergeNodeOverrideData } from '../common/node';
import type { FigmaNode, FigmaParseOptions } from '../types';

export function regularPolygonNodeToPathElement(figmaNode: FigmaNode<'REGULAR_POLYGON'>, opts: FigmaParseOptions<'REGULAR_POLYGON'>): Element<'path'> {
  const overrideData = mergeNodeOverrideData<'REGULAR_POLYGON'>(figmaNode, opts);
  const node = { ...figmaNode, ...overrideData };
  const elemBase = nodeToElementBase(node);
  const elem: Element<'path'> = {
    ...elemBase,
    type: 'path',
    detail: {
      commands: getFillPathCommands(node),
      originX: 0,
      originY: 0,
      originW: elemBase.w,
      originH: elemBase.h
    }
  };
  const fillColor = getFillColor(node);
  if (fillColor) {
    elem.detail.fill = fillColor;
  }
  const operations: Required<Element<'rect'>>['operations'] = nodeToOperations(node);
  // const detail: Required<Element<'rect'>>['detail'] = nodeToBaseDetail(node);
  elem.operations = operations;
  // elem.detail = detail;
  return elem;
}
