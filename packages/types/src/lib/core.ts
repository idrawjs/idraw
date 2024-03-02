import type { Element, ElementType } from './element';
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
  type: CursorType | string | null;
  groupQueue?: Element<'group'>[];
  element?: Element<ElementType>;
}

export interface CoreEventSelect {
  uuids: string[];
  positions?: Array<Array<number>>;
}
export interface CoreEventChange {
  type: string;
  data: Data;
}
export interface CoreEventScale {
  scale: number;
}

export type CoreEventMap = BoardBaseEventMap & {
  cursor: CoreEventCursor;
  change: CoreEventChange;
  [key: string]: any;
};
