import type { ElementSizeController } from '@idraw/types';
import {
  keyActionType,
  keyResizeType,
  keyAreaStart,
  keyAreaEnd,
  keyGroupQueue,
  keyGroupQueueVertexesList,
  keyHoverElement,
  keyHoverElementVertexes,
  keySelectedElementList,
  keySelectedElementListVertexes,
  keySelectedElementController
} from './config';

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
  BoardMiddleware,
  ViewRectVertexes
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

export type SelectedElementSizeController = Record<string, ControllerStyle>;

export type ResizeType =
  | 'resize-left'
  | 'resize-right'
  | 'resize-top'
  | 'resize-bottom'
  | 'resize-top-left'
  | 'resize-top-right'
  | 'resize-bottom-left'
  | 'resize-bottom-right';

export type PointTargetType = null | ResizeType | 'list-area' | 'over-element';

export interface PointTarget {
  type: PointTargetType;
  elements: Element<ElementType>[];
  groupQueue: Element<'group'>[];
  elementVertexesList: ViewRectVertexes[];
  groupQueueVertexesList: ViewRectVertexes[];
}

export type AreaSize = ElementSize;

export type ActionType = 'select' | 'drag-list' | 'drag-list-end' | 'drag' | 'hover' | 'resize' | 'area' | null;

export type DeepSelectorSharedStorage = {
  [keyActionType]: ActionType | null;
  [keyResizeType]: ResizeType | null;
  [keyAreaStart]: Point | null;
  [keyAreaEnd]: Point | null;
  [keyGroupQueue]: Element<'group'>[];
  [keyGroupQueueVertexesList]: ViewRectVertexes[];
  [keyHoverElement]: Element<ElementType> | null;
  [keyHoverElementVertexes]: ViewRectVertexes | null;
  [keySelectedElementList]: Array<Element<ElementType>>;
  [keySelectedElementListVertexes]: ViewRectVertexes | null;
  [keySelectedElementController]: ElementSizeController | null;
};
