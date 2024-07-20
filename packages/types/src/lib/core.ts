import type { Element, ElementSize, ElementType, ElementPosition } from './element';
import type { ViewScaleInfo } from './view';
import type { Data } from './data';
import type { ViewContext2D } from './context2d';
import type { BoardBaseEventMap } from './board';

export interface CoreOptions {
  width: number;
  height: number;
  devicePixelRatio?: number;
  createCustomContext2D?: (opts: { width: number; height: number; devicePixelRatio: number }) => ViewContext2D;
}

export type CursorType =
  | 'resize-left'
  | 'resize-right'
  | 'resize-top'
  | 'resize-bottom'
  | 'resize-top-left'
  | 'resize-top-right'
  | 'resize-bottom-left'
  | 'resize-bottom-right'
  | 'drag-default'
  | 'drag-active'
  | 'default';

export interface CoreEventCursor {
  type?: CursorType | string | null;
  groupQueue?: Element<'group'>[];
  element?: Element<ElementType> | ElementSize | null;
}

// export interface CoreEventSelect {
//   uuids: string[];
//   positions?: Array<Array<number>>;
// }
export interface CoreEventChange {
  data: Data;
  type:
    | 'updateElement'
    | 'deleteElement'
    | 'moveElement'
    | 'addElement'
    | 'dragElement'
    | 'resizeElement'
    | 'setData'
    | 'undo'
    | 'redo'
    | 'changeLayout' // TODO
    | 'other';
  selectedElements?: Element[] | null;
  hoverElement?: Element | null;
}
export interface CoreEventScale {
  scale: number;
}

type CoreEventTextEdit = {
  element: Element<'text'>;
  position: ElementPosition;
  groupQueue: Element<'group'>[];
  viewScaleInfo: ViewScaleInfo;
};

type CoreEventTextChange = {
  element: {
    uuid: string;
    detail: {
      text: string;
    };
  };
  position: ElementPosition;
};

type CoreEventContextMenu = {
  pointerContainer: HTMLDivElement;
  selectedElements: Element[];
};

export type CoreEventMap = BoardBaseEventMap & {
  cursor: CoreEventCursor;
  change: CoreEventChange;
  ruler: { show: boolean; showGrid: boolean };
  scale: { scale: number };
  select: { uuids?: string[]; positions?: ElementPosition[] };
  clearSelect: { uuids?: string[] } | void;
  textEdit: CoreEventTextEdit;
  textChange: CoreEventTextChange;
  contextMenu: CoreEventContextMenu;
  selectInGroup: { enable: boolean };
  snapToGrid: { enable: boolean };
};
