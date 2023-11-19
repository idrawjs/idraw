import type { Element, ElementType } from './element';
import type { Data } from './data';

export interface CoreOptions {
  width: number;
  height: number;
  devicePixelRatio?: number;
}

export type CursorType =
  | 'resize-left'
  | 'resize-right'
  | 'resize-top'
  | 'resize-bottom'
  | 'resize-top-left'
  | 'resize-top-right'
  | 'resize-bottom-left'
  | 'resize-bottom-right';

export interface CoreEventCursor {
  type: CursorType | string | null;
  groupQueue: Element<'group'>[];
  element: Element<ElementType>;
}

export interface CoreEventSelect {
  uuids: string[];
}
export interface CoreEventChange {
  data: Data;
}
export interface CoreEventScale {
  scale: number;
}

export type CoreEvent = {
  cursor: CoreEventCursor;
  change: CoreEventChange;
  [key: string]: any;
};
