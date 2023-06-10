import { keyHoverElementSize, keyActionType, keyResizeType, keyAreaStart, keyAreaEnd, keyInGroupQueue } from './config';

import {
  Data,
  ElementSize,
  ElementType,
  Element,
  ViewContext2D,
  Point,
  PointSize,
  ViewScaleInfo,
  ViewSizeInfo,
  ViewCalculator,
  PointWatcherEvent,
  BoardMiddleware
} from '@idraw/types';

export {
  Data,
  ElementType,
  Element,
  ElementSize,
  ViewContext2D,
  Point,
  PointSize,
  ViewScaleInfo,
  ViewSizeInfo,
  ViewCalculator,
  PointWatcherEvent,
  BoardMiddleware
};

export type ControllerStyle = ElementSize & {
  borderWidth: number;
  borderColor: string;
  bgColor: string;
};

export type ElementSizeController = Record<string, ControllerStyle>;

export type ResizeType = 'resize-left' | 'resize-right' | 'resize-top' | 'resize-bottom';

export type PointTargetType = null | 'list-area' | 'over-element' | ResizeType;

export interface PointTarget {
  type: PointTargetType;
  elements: Element<ElementType>[];
  indexes: Array<number | string>;
  uuids: string[];
}

export type AreaSize = ElementSize;

export type ActionType = 'select' | 'drag-list' | 'drag-list-end' | 'drag' | 'hover' | 'resize' | 'area' | null;

export type DeepSelectorSharedStorage = {
  [keyHoverElementSize]: ElementSize | null;
  [keyActionType]: ActionType;
  [keyResizeType]: ResizeType | null;
  [keyAreaStart]: Point | null;
  [keyAreaEnd]: Point | null;
  [keyInGroupQueue]: Element<'group'>[] | null;
};
