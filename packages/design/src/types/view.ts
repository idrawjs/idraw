import type { ElementType } from '@idraw/types';
import type { DesignItemType } from './data';

export interface ViewTreeNode {
  title: string;
  key: string;
  type: DesignItemType | ElementType;
  children?: ViewTreeNode[];
}
