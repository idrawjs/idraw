import { ViewRectVertexes } from './view';
import { PointSize } from './point';
import { ElementSize } from './element';

export type ElementSizeControllerType =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-middle'
  | 'right-middle'
  | 'top-middle'
  | 'bottom-middle'
  | 'rotate';

export interface ElementSizeControllerItem {
  type: ElementSizeControllerType;
  vertexes: ViewRectVertexes;
  center: PointSize;
  size: number;
}

export interface ElementSizeController {
  originalElementCenter: PointSize;
  originalElementSize: ElementSize;
  elementWrapper: ViewRectVertexes;
  top: ElementSizeControllerItem;
  bottom: ElementSizeControllerItem;
  left: ElementSizeControllerItem;
  right: ElementSizeControllerItem;
  topLeft: ElementSizeControllerItem;
  topRight: ElementSizeControllerItem;
  bottomLeft: ElementSizeControllerItem;
  bottomRight: ElementSizeControllerItem;
  topMiddle: ElementSizeControllerItem;
  bottomMiddle: ElementSizeControllerItem;
  leftMiddle: ElementSizeControllerItem;
  rightMiddle: ElementSizeControllerItem;
  rotate: ElementSizeControllerItem;
}

export type LayoutSizeController = Omit<ElementSizeController, 'rotate' | 'elementWrapper' | 'originalElementCenter' | 'originalElementSize'>;
