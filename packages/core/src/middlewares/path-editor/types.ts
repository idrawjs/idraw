import type { Point, Context2DCommand } from '@idraw/types';
// import { keySelectedMaterialList } from '../selector/static';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PathEditorSharedStorage = {
  // [keySelectedMaterialList]: null | Material[];
};

export type CommandItem = {
  id: string;
  name: Context2DCommand['name'];
  start: Point;
  end: Point;
  ctrl1?: Point;
  ctrl2?: Point;
  center?: Point;
};

export type Directioner = {
  anchorId: string;
  openedByAnchorId: string;
  anchorPoint: Point;
  directPoint: Point;
};

export type AnchorInfo = {
  id: string;
  index: number;
};

export type DirectorInfo = {
  type: 'curve-ctrl1' | 'curve-ctrl2';
  fromAnchorId: string;
  openedAnchorId: string;
};
