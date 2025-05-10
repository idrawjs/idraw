import type { Element, ElementPosition } from './element';
import type { RecursivePartial } from './util';

type ModifyInfoType = 'updateElement' | 'addElement' | 'deleteElement' | 'moveElement';

type ModifiedElement = Omit<RecursivePartial<Element>, 'uuid'>;

interface ModifyInfoContentMap {
  updateElement: {
    position: ElementPosition;
    beforeModifiedElement: ModifiedElement;
    afterModifiedElement: ModifiedElement;
  };
  addElement: { position: ElementPosition; element: Element };
  deleteElement: { position: ElementPosition; element: Element };
  moveElement: { from: ElementPosition; to: ElementPosition };
}

export interface ModifyInfo<T extends ModifyInfoType = ModifyInfoType> {
  type: T;
  content: ModifyInfoContentMap[T];
}
