import type { Element, ElementType, ElementSize, ElementBaseDesc } from '@idraw/types';

export type DesignItemType = 'component' | 'component-item' | 'module' | 'page';

export type DesignDrawDataType = 'component' | 'module' | 'page';

export type DesignComponentItem = ElementSize & {
  uuid: string;
  type: 'component-item';
  name: string;
  detail?: ElementBaseDesc & {
    children: Array<Element<ElementType> | DesignComponentItem>;
  };
};

export type DesignComponent = ElementSize & {
  uuid: string;
  type: 'component';
  name: string;
  detail?: ElementBaseDesc & {
    default: DesignComponentItem;
    variants: DesignComponentItem[];
  };
};

export type DesignModule = ElementSize & {
  uuid: string;
  type: 'module';
  name: string;
  detail?: ElementBaseDesc & {
    children: Array<DesignComponent>;
  };
};

export type DesignPage = ElementSize & {
  uuid: string;
  type: 'page';
  name: string;
  detail: ElementBaseDesc & {
    children: Array<DesignModule>;
  };
};

export interface DesignData {
  components: DesignComponent[];
  modules: DesignModule[];
  pages: DesignPage[];
}
