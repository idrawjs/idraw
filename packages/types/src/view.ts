import type { StrictMaterial, MaterialType } from './material';
import type { Point } from './point';
import type { Data } from './data';
import type { ViewContext2D } from './context2d';
import type { ModifyInfo } from './modify-info';
import type { VirtualItem } from './virtual';
import type { BoundingInfo } from './bounding';

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
  needRender(mtrl: StrictMaterial<MaterialType>): boolean;
  forceVisiable(id: string): void;
  getPointMaterial(
    p: Point,
    opts: {
      data: Data;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
      groupQueue?: StrictMaterial<'group'>[];
    }
  ): { index: number; material: null | StrictMaterial<MaterialType>; groupQueueIndex: number };
  resetVirtualItemMap(
    data: Data,
    opts: {
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void;
  updateVisiableStatus(opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): void;
  calcViewBoundingInfoFromOrigin(
    id: string,
    opts: {
      checkVisible?: boolean;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): BoundingInfo | null;
  calcViewBoundingInfoFromRange(
    id: string,
    opts: {
      checkVisible?: boolean;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): BoundingInfo | null;
  modifyVirtualItemMap(
    data: Data,
    opts: {
      modifyInfo: ModifyInfo;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void;

  toGridNum(num: number, opts?: { ignore?: boolean }): number;
  getVirtualItem: (id: string) => VirtualItem | null;
  modifyVirtualAttributes(
    material: StrictMaterial,
    opts: {
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
      groupQueue: StrictMaterial<'group'>[];
    }
  ): void;
}

export type ViewRectVertexes = [Point, Point, Point, Point];
