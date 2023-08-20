import type { ElementType } from '@idraw/types';
import type { LabItemType } from './data';

export interface ViewTreeNode {
  title: string;
  key: string;
  type: LabItemType | ElementType;
  children?: ViewTreeNode[];
}
