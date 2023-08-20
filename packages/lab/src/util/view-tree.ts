import type { Element, ElementType } from '@idraw/types';
import { ViewTreeNode, LabComponent, LabComponentItem } from '../types';

function parseElementToViewTreeNode(elem: Element<ElementType>): ViewTreeNode | null {
  let treeNode: ViewTreeNode | null = null;
  if (elem.uuid) {
    treeNode = {
      key: elem.uuid,
      title: elem.name || 'Unamed',
      type: elem.type,
      children: []
    };
    if (Array.isArray((elem as Element<'group'>)?.detail?.children)) {
      (elem as Element<'group'>).detail.children.forEach((child: Element<ElementType>) => {
        const childNode = parseElementToViewTreeNode(child);
        if (childNode) {
          treeNode?.children?.push(childNode);
        }
      });
    }
  }
  return treeNode;
}

function parseComponentItemToViewTreeNode(comp: LabComponentItem): ViewTreeNode {
  const treeNode: Required<ViewTreeNode> = {
    key: comp.uuid,
    title: comp.name || 'Unamed',
    type: comp.type,
    children: []
  };

  if (comp?.detail?.children && Array.isArray(comp?.detail?.children)) {
    comp.detail.children.forEach((child) => {
      let childNode: ViewTreeNode | null = null;
      if (child.type === 'component') {
        childNode = parseComponentToViewTreeNode(child as LabComponent);
      } else {
        childNode = parseElementToViewTreeNode(child as Element<ElementType>);
      }
      if (childNode) {
        treeNode.children.push(childNode);
      }
    });
  }
  return treeNode;
}

export function parseComponentToViewTreeNode(comp: LabComponent): ViewTreeNode {
  const treeNode: Required<ViewTreeNode> = {
    key: comp.uuid,
    title: comp.name || 'Unamed',
    type: comp.type,
    children: []
  };

  if (comp?.detail?.default) {
    const node = parseComponentItemToViewTreeNode(comp.detail.default);
    treeNode.children.push(node);
  }

  if (Array.isArray(comp?.detail?.variants)) {
    comp?.detail?.variants?.forEach((child: LabComponentItem) => {
      const node = parseComponentItemToViewTreeNode(child);
      treeNode.children.push(node);
    });
  }

  return treeNode;
}
