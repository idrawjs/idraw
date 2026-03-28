import {
  Data,
  MaterialSize,
  MaterialType,
  StrictMaterial,
  Material,
  ViewContext2D,
  Point,
  ViewScaleInfo,
  ViewSizeInfo,
  ViewCalculator,
  PointWatcherEvent,
  Middleware,
  ViewRectVertexes,
  MaterialPosition,
  ModifyRecord,
} from '@idraw/types';
import {
  keyPrevPoint,
  keyPointStartMaterialSizeList,
  keyMoveOriginalStartPoint,
  keyMoveOriginalStartMaterialSize,
  keyInBusyMode,
  keyHasChangedData,
  keyStartResizeGroupRecord,
  keyEndResizeGroupRecord,

  // legacy
  keyActionType,
  keyResizeType,
  keyAreaStart,
  keyAreaEnd,
  keyGroupQueue,
  keyHoverMaterial,
  keySelectedMaterialList,
  keySelectedMaterialListVertexes,
  keySelectedMaterialPosition,
  keyIsMoving,
  keyEnableSelectInGroup,
  keyEnableSnapToGrid,
} from './static';
import { keyLayoutIsSelected, keyLayoutIsBusyMoving } from '../layout-selector';

export {
  Data,
  MaterialType,
  Material,
  MaterialSize,
  ViewContext2D,
  Point,
  ViewScaleInfo,
  ViewSizeInfo,
  ViewCalculator,
  PointWatcherEvent,
  Middleware,
};

export type ControllerStyle = MaterialSize & {
  strokeWidth: number;
  stroke: string;
  background: string;
};

export type SelectedMaterialSizeController = Record<string, ControllerStyle>;

export type ResizeType =
  | 'resize-left'
  | 'resize-right'
  | 'resize-top'
  | 'resize-bottom'
  | 'resize-top-left'
  | 'resize-top-right'
  | 'resize-bottom-left'
  | 'resize-bottom-right'
  | 'resize-rotate';

export type PointTargetType = null | ResizeType | 'list-area' | 'over-material';

export interface PointTarget {
  type: PointTargetType;
  materials: StrictMaterial<MaterialType>[];
  groupQueue: StrictMaterial<'group'>[];
  materialVertexesList: ViewRectVertexes[];
  // groupQueueVertexesList: ViewRectVertexes[];
}

export type AreaSize = MaterialSize;

export type ActionType = 'select' | 'drag-list' | 'drag-list-end' | 'drag' | 'hover' | 'resize' | 'area' | null;

export type DeepSelectorSharedStorage = {
  [keyPrevPoint]: Point | null; //  null;
  [keyPointStartMaterialSizeList]: Array<Partial<MaterialSize> & { id: string }>; // [];
  [keyMoveOriginalStartPoint]: Point | null; // null;
  [keyMoveOriginalStartMaterialSize]: MaterialSize | null; //  null;
  [keyInBusyMode]: 'resize' | 'drag' | 'drag-list' | 'area' | null; // null;
  [keyHasChangedData]: boolean | null; // null;
  [keyStartResizeGroupRecord]: ModifyRecord<'resizeMaterials'> | null; // null;
  [keyEndResizeGroupRecord]: ModifyRecord<'resizeMaterials'> | null; // null;

  // legacy
  [keyActionType]: ActionType | null;
  [keyResizeType]: ResizeType | null;
  [keyAreaStart]: Point | null;
  [keyAreaEnd]: Point | null;
  [keyGroupQueue]: StrictMaterial<'group'>[];
  [keyHoverMaterial]: StrictMaterial<MaterialType> | null;
  [keySelectedMaterialList]: Array<StrictMaterial<MaterialType>>;
  [keySelectedMaterialListVertexes]: ViewRectVertexes | null;
  [keySelectedMaterialPosition]: MaterialPosition;
  [keyIsMoving]: boolean | null;
  [keyEnableSelectInGroup]: boolean | null;
  [keyEnableSnapToGrid]: boolean | null;

  // layout-selector
  [keyLayoutIsSelected]: boolean | null;
  [keyLayoutIsBusyMoving]: boolean | null;
};
