import type { Element, ElementPosition } from './element';
import type { RecursivePartial } from './util';

export type ModifyType = 'update-element' | 'add-element' | 'delete-element' | 'move-element';

export type ModifyElement = Omit<RecursivePartial<Element>, 'uuid'> & { uuid: string };

export interface ModifyDataMap {
  'update-element': { position: ElementPosition; modifyElement: ModifyElement };
  'add-element': { position: ElementPosition; element: Element };
  'delete-element': { position: ElementPosition; element: Element };
  'move-element': { from: ElementPosition; to: ElementPosition };
}

export interface ModifyItem<T extends ModifyType> {
  type: T;
  data: ModifyDataMap[T];
  time: number;
}
