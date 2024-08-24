import type { CoreOptions } from './core';
import type { MiddlewareSelectorStyle, MiddlewareInfoStyle, MiddlewareRulerStyle, MiddlewareScrollerStyle, MiddlewareLayoutSelectorStyle } from './middleware';

export type IDrawMode = 'select' | 'drag' | 'readOnly';

export type IDrawFeature = 'ruler' | 'scroll' | 'scale' | 'info' | 'selectInGroup' | 'snapToGrid'; // TODO other feature

export interface IDrawSettings {
  mode?: IDrawMode;
  styles?: {
    selector?: Partial<MiddlewareSelectorStyle>;
    info?: Partial<MiddlewareInfoStyle>;
    ruler?: Partial<MiddlewareRulerStyle>;
    scroller?: Partial<MiddlewareScrollerStyle>;
    layoutSelector?: Partial<MiddlewareLayoutSelectorStyle>;
  };
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
  middlewareStyles: Required<Required<IDrawSettings>['styles']>;
}
