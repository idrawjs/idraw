import type { CoreOptions } from './core';

export type IDrawMode = 'select' | 'drag' | 'readOnly';

export type IDrawFeature = 'ruler' | 'scroll' | 'scale' | 'info' | 'selectInGroup'; // TODO other feature

export interface IDrawSettings {
  mode?: IDrawMode;
}

export type IDrawOptions = CoreOptions & IDrawSettings;

export interface IDrawStorage {
  mode: IDrawMode;
  enableRuler: boolean;
  enableScale: boolean;
  enableScroll: boolean;
  enableSelect: boolean;
  enableTextEdit: boolean;
  enableDrag: boolean;
  enableInfo: boolean;
}
