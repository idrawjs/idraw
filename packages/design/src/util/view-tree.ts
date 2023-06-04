import type { Element, ElementType } from '@idraw/types';
import { ViewTreeNode, DesignComponent, DesignComponentItem } from '../types';

function parseElementToViewTreeNode(elem: Element<ElementType>): ViewTreeNode | null {
  let treeNode: ViewTreeNode | null = null;
  if (elem.uuid) {
    treeNode = {
      key: elem.uuid,
      title: elem.name || 'Unamed',
      type: elem.type,
      children: []
    };
    if (Array.isArray((elem as Element<'group'>)?.desc?.children)) {
      (elem as Element<'group'>).desc.children.forEach((child: Element<ElementType>) => {
        const childNode = parseElementToViewTreeNode(child);
        if (childNode) {
          treeNode?.children?.push(childNode);
        }
      });
    }
  }
  return treeNode;
}

function parseComponentItemToViewTreeNode(comp: DesignComponentItem): ViewTreeNode {
  const treeNode: Required<ViewTreeNode> = {
    key: comp.uuid,
    title: comp.name || 'Unamed',
    type: comp.type,
    children: []
  };

  if (comp?.desc?.children && Array.isArray(comp?.desc?.children)) {
    comp.desc.children.forEach((child) => {
      let childNode: ViewTreeNode | null = null;
      if (child.type === 'component') {
        childNode = parseComponentToViewTreeNode(child as DesignComponent);
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

export function parseComponentToViewTreeNode(comp: DesignComponent): ViewTreeNode {
  const treeNode: Required<ViewTreeNode> = {
    key: comp.uuid,
    title: comp.name || 'Unamed',
    type: comp.type,
    children: []
  };

  if (comp?.desc?.default) {
    const node = parseComponentItemToViewTreeNode(comp.desc.default);
    treeNode.children.push(node);
  }

  if (Array.isArray(comp?.desc?.variants)) {
    comp?.desc?.variants?.forEach((child: DesignComponentItem) => {
      const node = parseComponentItemToViewTreeNode(child);
      treeNode.children.push(node);
    });
  }

  return treeNode;
}
