import type { BoundingInfo } from './bounding';
import type { MaterialPosition, MaterialType, StrictMaterial } from './material';
import type { ViewContext2D } from './context2d';
import type { PathAnchorCommand, PathCommand } from './path';
import type { Point } from './point';

export type CalcVirtualAttributesOptions = {
  tempContext: ViewContext2D;
  dpr: number;
  groupQueue: StrictMaterial<'group'>[];
};

export type VirtualTextLine = {
  x: number;
  y: number;
  width: number;
  text: string;
};

export type VirtualBaseAttributes = {
  commands?: PathCommand[];
  worldCenter: Point;
  worldAngle: number;
};

export type VirtualRectAttributes = Required<VirtualBaseAttributes>;

export type VirtualTextAttributes = VirtualBaseAttributes & {
  textLines: Array<VirtualTextLine>;
};

export type VirtualPathAttributes = VirtualBaseAttributes & {
  anchorCommands: PathAnchorCommand[];
};

export type VirtualAttributes = Partial<VirtualBaseAttributes> &
  Partial<VirtualTextAttributes> &
  Partial<VirtualPathAttributes> & {
    // TODO
  };

export type VirtualItem = {
  type: MaterialType;
  position: MaterialPosition;
  boundingInfo: BoundingInfo;
  rangeBoundingInfo: BoundingInfo;
  isVisibleInView: boolean;
} & VirtualAttributes;

export type VirtualItemMap = {
  [id: string]: VirtualItem;
};

export interface VirtualFlatStorage {
  virtualItemMap: VirtualItemMap;
  visibleCount: number;
  invisibleCount: number;
}
