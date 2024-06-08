import type { Element } from '@idraw/types';
import { nodeToElementBase, nodeToBaseDetail } from './base';
import { nodeToOperations } from './operations';
import { mergeNodeOverrideData } from '../common/node';
import type { FigmaNode, FigmaParseOptions } from '../types';

export function roundedRectangleNodeToRectElement(figmaNode: FigmaNode<'ROUNDED_RECTANGLE'>, opts: FigmaParseOptions<'ROUNDED_RECTANGLE'>): Element<'rect'> {
  const overrideData = mergeNodeOverrideData<'ROUNDED_RECTANGLE'>(figmaNode, opts);
  const node = { ...figmaNode, ...overrideData };

  const elemBase = nodeToElementBase(node as FigmaNode);
  const elem: Element<'rect'> = {
    ...elemBase,
    type: 'rect',
    detail: {}
  };
  const operations: Required<Element<'rect'>>['operations'] = nodeToOperations(node as FigmaNode);
  const detail: Required<Element<'rect'>>['detail'] = nodeToBaseDetail(node as FigmaNode);
  elem.operations = operations;
  elem.detail = detail;
  return elem;
}
