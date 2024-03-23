import type { Element, ElementType, ElementPosition } from './element';
import type { Point, PointSize } from './point';
import type { Data } from './data';
import type { ViewContext2D } from './context2d';
import type { ModifyOptions } from './modify';

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
  helperContext: ViewContext2D;
  underContext: ViewContext2D;
  drawView: () => void;
}

export interface ViewCalculatorOptions {
  // boardContent?: BoardContent;
  viewContext: ViewContext2D;
}

export interface ViewCalculatorStorage {
  viewVisibleInfoMap: ViewVisibleInfoMap;
  visibleCount: number;
  invisibleCount: number;
}

export interface ViewCalculator {
  /**
   * @deprecated
   */
  isPointInElement(p: Point, elem: Element<ElementType>, viewScaleInfo: ViewScaleInfo, viewSize: ViewSizeInfo): boolean;
  needRender(elem: Element<ElementType>): boolean;
  getPointElement(
    p: Point,
    opts: { data: Data; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo; groupQueue?: Element<'group'>[] }
  ): { index: number; element: null | Element<ElementType>; groupQueueIndex: number };
  resetViewVisibleInfoMap(
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
  modifyViewVisibleInfoMap(
    data: Data,
    opts: {
      modifyOptions: ModifyOptions;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void;

  toGridNum(num: number, opts?: { ignore?: boolean }): number;
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

export type ViewRectInfoMap = {
  originRectInfo: ViewRectInfo;
  rangeRectInfo: ViewRectInfo;
};

export type ViewVisibleInfo = ViewRectInfoMap & {
  isVisibleInView: boolean;
  isGroup: boolean;
  position: ElementPosition;
};

export type ViewVisibleInfoMap = {
  [uuid: string]: ViewVisibleInfo;
};
