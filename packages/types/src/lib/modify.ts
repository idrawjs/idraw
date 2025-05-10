import type { Element, ElementPosition, ElementOperations } from './element';
import type { DataGlobal } from './data';

export type ModifyMethod =
  | 'updateElement'
  | 'modifyElement'
  | 'deleteElement'
  | 'moveElement'
  | 'addElement'
  | 'dragElement'
  | 'dragElements'
  | 'modifyElements'
  | 'dragLayout'
  | 'modifyLayout'
  | 'modifyGlobal';

export type ModifyType = ModifyMethod | 'undo' | 'redo';

/**
 * FlattenElement
 For example:
 { 
    "x": 0,
    "y": 0,
    "w": 0,
    "h": 0,
    "detail.color": "#FFFFFF",
    "detail.borderWidth[0]": 10,
    "detail.borderWidth[1]": 20,
    "detail.borderWidth[2]": 30,
    "detail.borderWidth[3]": 40,
  }
 */
export type FlattenElement = Record<string, string | number | undefined | null>;

/**
 * ModifiedLayoutDetail
 For example:
 { 
    "x": 0,
    "y": 0,
    "w": 0,
    "h": 0,
    "detail.color": "#FFFFFF",
    "detail.borderWidth[0]": 10,
    "detail.borderWidth[1]": 20,
    "detail.borderWidth[2]": 30,
    "detail.borderWidth[3]": 40,
  }
 */
export type FlattenLayout = Record<string, string | number | undefined | null>;

/**
 * FlattenGlobal
 For example:
 {  
    "background": "#FFFFFF", 
  }
 */
export type FlattenGlobal = Partial<DataGlobal>;

export type ModifiedElementOperations = Partial<ElementOperations>;

export interface ModifyContentMap {
  updateElement: {
    method: 'updateElement';
    uuid: string;
    before: FlattenElement | null;
    after: FlattenElement | null;
  };
  modifyElement: {
    method: 'modifyElement';
    uuid: string;
    before: FlattenElement | null;
    after: FlattenElement | null;
  };
  addElement: {
    method: 'addElement';
    uuid: string;
    position: ElementPosition;
    element: Element;
  };
  deleteElement: {
    method: 'deleteElement';
    uuid: string;
    position: ElementPosition;
    element: Element | null;
  };
  moveElement: {
    method: 'moveElement';
    uuid: string;
    from: ElementPosition;
    to: ElementPosition;
  };
  dragElement: {
    method: 'modifyElement';
    uuid: string;
    before: FlattenElement | null;
    after: FlattenElement | null;
  };
  dragElements: {
    method: 'modifyElements';
    before: (FlattenLayout & { uuid: string })[];
    after: (FlattenLayout & { uuid: string })[];
  };
  dragLayout: {
    method: 'modifyElement';
    before: FlattenLayout;
    after: FlattenLayout;
  };
  modifyLayout: {
    method: 'modifyLayout';
    before: FlattenLayout | null;
    after: FlattenLayout | null;
  };
  modifyElements: {
    method: 'modifyElements';
    before: (FlattenLayout & { uuid: string })[];
    after: (FlattenLayout & { uuid: string })[];
  };
  modifyGlobal: {
    method: 'modifyGlobal';
    before: FlattenGlobal | null;
    after: FlattenGlobal | null;
  };
}

export interface ModifyRecordMap {
  updateElement: {
    type: 'updateElement';
    time: number;
    content: ModifyContentMap['updateElement'];
  };
  modifyElement: {
    type: 'modifyElement';
    time: number;
    content: ModifyContentMap['modifyElement'];
  };
  addElement: {
    type: 'addElement';
    time: number;
    content: ModifyContentMap['addElement'];
  };
  deleteElement: {
    type: 'deleteElement';
    time: number;
    content: ModifyContentMap['deleteElement'];
  };
  moveElement: {
    type: 'moveElement';
    time: number;
    content: ModifyContentMap['moveElement'];
  };
  dragElement: {
    type: 'dragElement';
    time: number;
    content: ModifyContentMap['modifyElement'];
  };
  dragElements: {
    type: 'dragElements';
    time: number;
    content: ModifyContentMap['modifyElements'];
  };
  modifyElements: {
    type: 'modifyElements';
    time: number;
    content: ModifyContentMap['modifyElements'];
  };
  dragLayout: {
    type: 'dragLayout';
    time: number;
    content: ModifyContentMap['dragLayout'];
  };
  modifyLayout: {
    type: 'modifyLayout';
    time: number;
    content: ModifyContentMap['modifyLayout'];
  };
  modifyGlobal: {
    type: 'modifyGlobal';
    time: number;
    content: ModifyContentMap['modifyGlobal'];
  };
  undo: {
    type: 'undo';
    time: number;
    content: ModifyContentMap[ModifyMethod];
  };
  redo: {
    type: 'redo';
    time: number;
    content: ModifyContentMap[ModifyMethod];
  };
}

export type ModifyRecord<T extends ModifyType = ModifyType> = ModifyRecordMap[T];
