import type { Element, ElementPosition } from './element';
import type { RecursivePartial } from './util';

export type ModifyType = 'updateElement' | 'addElement' | 'deleteElement' | 'moveElement';

export type ModifiedElement = Omit<RecursivePartial<Element>, 'uuid'>;

export type ModifiedTargetElement = ModifiedElement & { uuid: string };

export interface ModifyContentMap {
  updateElement: { position: ElementPosition; beforeModifiedElement: ModifiedElement; afterModifiedElement: ModifiedElement };
  addElement: { position: ElementPosition; element: Element };
  deleteElement: { position: ElementPosition; element: Element };
  moveElement: { from: ElementPosition; to: ElementPosition };
}

export interface ModifyOptions<T extends ModifyType = ModifyType> {
  type: T;
  content: ModifyContentMap[T];
}

export interface ModifyRecordMap {
  updateElement: {
    type: 'updateElement';
    time: number;
  } & Required<ModifyContentMap['updateElement']>;
  addElement: {
    type: 'addElement';
    time: number;
  } & Required<ModifyContentMap['addElement']>;
  deleteElement: {
    type: 'deleteElement';
    time: number;
  } & Required<ModifyContentMap['deleteElement']>;
  moveElement: {
    type: 'moveElement';
    time: number;
    afterModifiedFrom: ElementPosition;
    afterModifiedTo: ElementPosition;
  } & Required<ModifyContentMap['moveElement']>;
}

export type ModifyRecord<T extends ModifyType = ModifyType> = ModifyRecordMap[T];
