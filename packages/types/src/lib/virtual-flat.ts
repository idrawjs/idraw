import type { ViewRectInfo } from './view';
import type { ElementPosition, ElementType } from './element';
import type { ViewContext2D } from './context2d';

export type CalcVirtualDetailOptions = {
  tempContext: ViewContext2D;
};

export type VirtualFlatTextLine = {
  x: number;
  y: number;
  width: number;
  text: string;
};

export type VirtualFlatTextDetail = {
  textLines?: Array<VirtualFlatTextLine>;
};
export type VirtualFlatDetail = VirtualFlatTextDetail & {
  // TODO
};

export type VirtualFlatItem = {
  type: ElementType;
  position: ElementPosition;
  originRectInfo: ViewRectInfo;
  rangeRectInfo: ViewRectInfo;
  isVisibleInView: boolean;
} & VirtualFlatDetail;

export type VirtualFlatItemMap = {
  [uuid: string]: VirtualFlatItem;
};

export interface VirtualFlatStorage {
  virtualFlatItemMap: VirtualFlatItemMap;
  visibleCount: number;
  invisibleCount: number;
}
