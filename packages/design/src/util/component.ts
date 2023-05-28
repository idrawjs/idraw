import { Data } from '@idraw/types';
import { ViewTreeNode, DesignData, DesignComponent } from '../types';

export function parseComponentViewTree(designData: DesignData | null): ViewTreeNode[] {
  const list: ViewTreeNode[] = [];
  designData?.components?.forEach((comp: DesignComponent) => {
    const children: ViewTreeNode[] = [];
    if (Array.isArray(comp?.desc?.children)) {
      comp?.desc?.children?.forEach((child) => {
        children.push({
          key: child.uuid,
          title: child.name || 'Unamed',
          children: []
        });
      });
    }
    list.push({
      key: comp.uuid,
      title: comp.name || 'Unamed',
      children
    });
  });
  return list;
}
