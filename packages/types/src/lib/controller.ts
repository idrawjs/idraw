import { ViewRectVertexes } from './view';

export type ElementSizeControllerType = 'left' | 'right' | 'top' | 'bottom';

export interface ElementSizeControllerItem {
  type: ElementSizeControllerType;
  vertexes: ViewRectVertexes;
}

export interface ElementSizeController {
  elementWrapper: ViewRectVertexes;
  left: ElementSizeControllerItem;
  right: ElementSizeControllerItem;
  top: ElementSizeControllerItem;
  bottom: ElementSizeControllerItem;
}
