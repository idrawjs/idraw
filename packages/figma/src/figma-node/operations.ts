import type { ElementOperations } from '@idraw/types';
import type { FigmaNode, FigmaNodeType } from '../types';

export function nodeToOperations(node: FigmaNode<FigmaNodeType>): ElementOperations {
  const operations: ElementOperations = {};
  const { visible } = node as FigmaNode<FigmaNodeType>;

  if (visible === false) {
    operations.invisible = true;
  }

  // TODO
  if (node.mask === true) {
    operations.invisible = true;
  }

  return operations;
}
