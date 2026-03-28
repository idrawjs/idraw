import type { StrictMaterial, MaterialSize, MaterialType, MaterialPosition } from './material';
import type { Data } from './data';
import type { BoardBaseEventMap } from './board';
import type { ModifyType, ModifyRecord } from './modify';
import type { IDrawMode } from './mode';

export interface CoreOptions {
  width: number;
  height: number;
  devicePixelRatio?: number;
  disableWatcher?: boolean;
}

export type CursorType =
  | 'resize-left'
  | 'resize-right'
  | 'resize-top'
  | 'resize-bottom'
  | 'resize-top-left'
  | 'resize-top-right'
  | 'resize-bottom-left'
  | 'resize-bottom-right'
  | 'drag-default'
  | 'drag-active'
  | 'default';

export interface CoreEventCursor {
  type?: CursorType | string | null;
  groupQueue?: StrictMaterial<'group'>[];
  material?: StrictMaterial<MaterialType> | MaterialSize | null;
}

// export interface CoreEventSelect {
//   ids: string[];
//   positions?: Array<Array<number>>;
// }
export interface CoreEventChange<T extends ModifyType = ModifyType> {
  data: Data;
  type: T | 'setData' | 'updatingMaterial' | 'other' | string;
  selectedMaterials?: StrictMaterial[] | null;
  hoverMaterial?: StrictMaterial | null;
  modifyRecord?: ModifyRecord<T> | null;
}
export interface CoreEventScale {
  scale: number;
}

export type CoreEventTextEdit = {
  id: string;
};

export type CoreEventPathEdit = {
  id?: string;
};

type CoreEventTextChange = {
  material: {
    id: string;
    attributes: {
      text: string;
    };
  };
  position: MaterialPosition;
};

type CoreEventContextMenu = {
  pointerContainer: HTMLDivElement;
  selectedMaterials: StrictMaterial[];
};

export type CoreEventMap = BoardBaseEventMap & {
  // basic
  cursor: CoreEventCursor;
  change: CoreEventChange;
  changing: CoreEventChange;
  ruler: { show: boolean; showGrid: boolean };
  scale: { scale: number };
  modeChange: { mode: IDrawMode };

  // create middleware
  create: { type: Exclude<MaterialType, 'path' | 'foreignObject' | 'svgCode'> };
  clearCreate: void;

  // select middleware
  select: {
    ids?: string[];
    positions?: MaterialPosition[];
    type?:
      | 'clickCanvas'
      | 'selectMaterial'
      | 'selectMaterials'
      | 'selectMaterialByPosition'
      | 'selectMaterialsByPositions'
      | 'other'
      | string;
  };
  selectLayout: void;
  clearSelect: { ids?: string[] } | void;
  selectInGroup: { enable: boolean };
  contextMenu: CoreEventContextMenu;
  snapToGrid: { enable: boolean };
  // text middleware
  textEdit: CoreEventTextEdit;
  textChange: CoreEventTextChange;
  // path editor middleware
  pathEdit: CoreEventPathEdit;
  clearPathEdit: void;
  // path creator middleware
  pathCreate: void;
  clearPathCreate: void;
};
