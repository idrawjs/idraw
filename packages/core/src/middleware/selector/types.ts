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
