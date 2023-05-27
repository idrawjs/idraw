import type { Element, ElementType, ElementSize, ElementBaseDesc } from '@idraw/types';

export type DesignComponent = Omit<ElementSize, 'angle'> & {
  uuid: string;
  type: 'component';
  name?: string;
  desc?: ElementBaseDesc & {
    children: Array<Element<ElementType> | DesignComponent>;
  };
};

export type DesignModule = Omit<ElementSize, 'angle'> & {
  uuid: string;
  type: 'module';
  name?: string;
  desc?: ElementBaseDesc & {
    children: Array<DesignComponent>;
  };
};

export type DesignPage = Omit<ElementSize, 'angle'> & {
  uuid: string;
  type: 'page';
  name?: string;
  desc: ElementBaseDesc & {
    children: Array<DesignModule>;
  };
};

export interface DesignData {
  components: DesignComponent[];
  modules: DesignModule[];
  pages: DesignPage[];
}
