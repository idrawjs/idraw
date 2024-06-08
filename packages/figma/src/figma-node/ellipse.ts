import type { Element } from '@idraw/types';
import { nodeToElementBase, nodeToBaseDetail } from './base';
import { nodeToOperations } from './operations';
import { mergeNodeOverrideData } from '../common/node';
import type { FigmaNode, FigmaParseOptions } from '../types';

export function ellipseNodeToCircleElement(figmaNode: FigmaNode<'ELLIPSE'>, opts: FigmaParseOptions<'ELLIPSE'>): Element<'circle'> {
  const overrideData = mergeNodeOverrideData<'ELLIPSE'>(figmaNode, opts);
  const node = { ...figmaNode, ...overrideData };

  const elemBase = nodeToElementBase(node as FigmaNode);
  const { w, h } = elemBase;
  const radius = Math.max(w, h) / 2;
  const baseDetail = nodeToBaseDetail(node as FigmaNode);
  const operations = nodeToOperations(node as FigmaNode);

  const elem: Element<'circle'> = {
    ...elemBase,
    type: 'circle',
    detail: {
      ...(baseDetail as Element<'circle'>['detail']),
      radius
    },
    operations
  };
  return elem;
}
