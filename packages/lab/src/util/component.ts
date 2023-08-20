import { ViewTreeNode, LabData, LabComponent } from '../types';
import { parseComponentToViewTreeNode } from './view-tree';

export function parseComponentViewTree(labData: LabData | null): ViewTreeNode[] {
  const treeNodes: ViewTreeNode[] = [];
  labData?.components?.forEach((comp: LabComponent) => {
    const node = parseComponentToViewTreeNode(comp);
    treeNodes.push(node);
  });
  return treeNodes;
}
