import type { Element } from '@idraw/types';
import { nodeToElementBase, getStrokeColor, getStrokePathCommands } from './base';
import { nodeToOperations } from './operations';
import { mergeNodeOverrideData } from '../common/node';
import type { FigmaNode, FigmaParseOptions } from '../types';

// TODO
export function lineNodeToPathElement(figmaNode: FigmaNode<'LINE'>, opts: FigmaParseOptions<'LINE'>): Element<'path'> {
  const overrideData = mergeNodeOverrideData<'LINE'>(figmaNode, opts);
  const node = { ...figmaNode, ...overrideData };

  const elemBase = nodeToElementBase(node);
  const strokeWidth = node.strokeWeight || 1;
  const height = elemBase.h || strokeWidth;
  const y = elemBase.h ? elemBase.y : elemBase.y - height / 2;
  const elem: Element<'path'> = {
    ...elemBase,
    y,
    h: height,
    type: 'path',
    detail: {
      commands: getStrokePathCommands(node),
      // strokeWidth: 1,
      originX: 0,
      originY: -height,
      originW: elemBase.w,
      originH: height
    }
  };
  const strokeColor = getStrokeColor(node);
  if (strokeColor) {
    // elem.detail.stroke = strokeColor;
    elem.detail.fill = strokeColor;
  }
  const operations: Required<Element<'rect'>>['operations'] = nodeToOperations(node);
  // const detail: Required<Element<'rect'>>['detail'] = nodeToBaseDetail(node);
  elem.operations = operations;
  // elem.detail = detail;
  return elem;
}
