import type { Element, ElementType } from './element';
import type { Point, PointSize } from './point';
import type { Data } from './data';
import type { ViewContext2D } from './context2d';
import type { ModifyInfo } from './modify-info';
import { VirtualFlatItem } from './virtual-flat';
// import type { BoxInfo } from './box';

export interface ViewScaleInfo {
  scale: number;
  offsetTop: number;
  offsetBottom: number;
  offsetLeft: number;
  offsetRight: number;
}

export interface ViewContextSize {
  contextWidth: number;
  contextHeight: number;
}

export interface ViewSizeInfo extends ViewContextSize {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface BoardContent {
  boardContext: ViewContext2D;
  viewContext: ViewContext2D;
  overlayContext: ViewContext2D;
  underlayContext: ViewContext2D;
  tempContext: ViewContext2D;
  drawView: () => void;
}

export interface ViewCalculatorOptions {
  // boardContent?: BoardContent;
  tempContext: ViewContext2D;
}

export interface ViewCalculator {
  needRender(elem: Element<ElementType>): boolean;
  getPointElement(
    p: Point,
    opts: { data: Data; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo; groupQueue?: Element<'group'>[] }
  ): { index: number; element: null | Element<ElementType>; groupQueueIndex: number };
  resetVirtualFlatItemMap(
    data: Data,
    opts: {
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void;
  updateVisiableStatus(opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): void;
  calcViewRectInfoFromOrigin(
    uuid: string,
    opts: {
      checkVisible?: boolean;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): ViewRectInfo | null;
  calcViewRectInfoFromRange(
    uuid: string,
    opts: {
      checkVisible?: boolean;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): ViewRectInfo | null;
  modifyVirtualFlatItemMap(
    data: Data,
    opts: {
      modifyInfo: ModifyInfo;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void;

  toGridNum(num: number, opts?: { ignore?: boolean }): number;
  getVirtualFlatItem: (uuid: string) => VirtualFlatItem | null;
  modifyText(element: Element<'text'>): void;
}

export type ViewRectVertexes = [PointSize, PointSize, PointSize, PointSize];

export interface ViewBoxSize {
  x: number;
  y: number;
  w: number;
  h: number;
  radiusList: [number, number, number, number];
}

export type ViewRectInfo = {
  topLeft: PointSize;
  topRight: PointSize;
  bottomRight: PointSize;
  bottomLeft: PointSize;
  top: PointSize;
  right: PointSize;
  bottom: PointSize;
  left: PointSize;
  center: PointSize;
};
