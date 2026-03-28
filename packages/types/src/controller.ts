import { ViewRectVertexes } from './view';
import { Point } from './point';
import { MaterialSize } from './material';

export type MaterialSizeControllerType =
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

export interface MaterialSizeControllerItem {
  type: MaterialSizeControllerType;
  vertexes: ViewRectVertexes;
  center: Point;
  size: number;
}

export interface MaterialSizeController {
  originalMaterialCenter: Point;
  originalMaterialSize: MaterialSize;
  materialWrapper: ViewRectVertexes;
  top: MaterialSizeControllerItem;
  bottom: MaterialSizeControllerItem;
  left: MaterialSizeControllerItem;
  right: MaterialSizeControllerItem;
  topLeft: MaterialSizeControllerItem;
  topRight: MaterialSizeControllerItem;
  bottomLeft: MaterialSizeControllerItem;
  bottomRight: MaterialSizeControllerItem;
  topMiddle: MaterialSizeControllerItem;
  bottomMiddle: MaterialSizeControllerItem;
  leftMiddle: MaterialSizeControllerItem;
  rightMiddle: MaterialSizeControllerItem;
  rotate: MaterialSizeControllerItem;
}

export type LayoutSizeController = Omit<
  MaterialSizeController,
  'rotate' | 'materialWrapper' | 'originalMaterialCenter' | 'originalMaterialSize'
>;
