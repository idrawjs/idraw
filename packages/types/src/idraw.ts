import { ModifyRecord } from './modify';
import type { CoreOptions } from './core';
import type {
  MiddlewareSelectorStyles,
  MiddlewareInfoStyles,
  MiddlewareRulerStyles,
  MiddlewareScrollerStyles,
  MiddlewareLayoutSelectorStyles,
  MiddlewareCreatorStyles,
  MiddlewareTextEditorStyles,
  MiddlewarePathCreatorStyles,
  MiddlewarePathEditorStyles,
} from './middleware';
import type { IDrawMode } from './mode';

export type IDrawFeature = 'ruler' | 'scroll' | 'scale' | 'info' | 'selectInGroup' | 'snapToGrid'; // TODO other feature

export interface IDrawSettings {
  mode?: IDrawMode;
  styles?: {
    creator?: Partial<MiddlewareCreatorStyles>;
    selector?: Partial<MiddlewareSelectorStyles>;
    textEditor?: Partial<MiddlewareTextEditorStyles>;
    pathCreator?: Partial<MiddlewarePathCreatorStyles>;
    pathEditor?: Partial<MiddlewarePathEditorStyles>;
    info?: Partial<MiddlewareInfoStyles>;
    ruler?: Partial<MiddlewareRulerStyles>;
    scroller?: Partial<MiddlewareScrollerStyles>;
    layoutSelector?: Partial<MiddlewareLayoutSelectorStyles>;
  };
  history?: boolean;
  historyLimit?: number;
}

export type IDrawOptions = CoreOptions & IDrawSettings;

export type HistoryHandler = {
  undo: () => void;
  redo: () => void;
  canUndo: () => void;
  canRedo: () => void;
  destroy: () => void;
  clear: () => void;
  __getDoRecords: () => ModifyRecord[];
  __getUndoRecords: () => ModifyRecord[];
};

export interface IDrawStorage {
  mode: IDrawMode;
  enableRuler: boolean;
  enableScale: boolean;
  enableScroll: boolean;
  enableCreate: boolean;
  enableSelect: boolean;
  enableSelectLayout: boolean;
  enableTextEdit: boolean;
  enableDrag: boolean;
  enableInfo: boolean;
  enablePathCreate: boolean;
  enablePathEdit: boolean;
  middlewareStyles: Required<Required<IDrawSettings>['styles']>;
}
