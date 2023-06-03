import { ViewTreeNode, DesignData, DesignComponent } from '../types';
import { parseComponentToViewTreeNode } from './view-tree';

export function parseComponentViewTree(designData: DesignData | null): ViewTreeNode[] {
  const treeNodes: ViewTreeNode[] = [];
  designData?.components?.forEach((comp: DesignComponent) => {
    const node = parseComponentToViewTreeNode(comp);
    treeNodes.push(node);
  });
  return treeNodes;
}
