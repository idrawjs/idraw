import type { Element, ElementType, ElementSize, ElementBaseDesc } from '@idraw/types';

export type LabItemType = 'component' | 'component-item' | 'module' | 'page';

export type LabDrawDataType = 'component' | 'module' | 'page';

export type LabComponentItem = ElementSize & {
  uuid: string;
  type: 'component-item';
  name: string;
  detail?: ElementBaseDesc & {
    children: Array<Element<ElementType> | LabComponentItem>;
  };
};

export type LabComponent = ElementSize & {
  uuid: string;
  type: 'component';
  name: string;
  detail?: ElementBaseDesc & {
    default: LabComponentItem;
    variants: LabComponentItem[];
  };
};

export type LabModule = ElementSize & {
  uuid: string;
  type: 'module';
  name: string;
  detail?: ElementBaseDesc & {
    children: Array<LabComponent>;
  };
};

export type LabPage = ElementSize & {
  uuid: string;
  type: 'page';
  name: string;
  detail: ElementBaseDesc & {
    children: Array<LabModule>;
  };
};

export interface LabData {
  components: LabComponent[];
  modules: LabModule[];
  pages: LabPage[];
}
