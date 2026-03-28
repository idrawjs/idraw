import type { BoardExtendEventMap, BoardMiddlewareObject, BoardMiddleware } from './board';
import type { Material } from './material';

export type Middleware<
  S extends Record<any | symbol, any> = any,
  E extends BoardExtendEventMap = BoardExtendEventMap,
  C extends any = undefined,
> = BoardMiddleware<S, E, C>;

export type MiddlewareObject = BoardMiddlewareObject;

// middleware selector
export type MiddlewareSelectorStyles = {
  zIndex: number;

  activeColor: string;

  handlerBorderColor: string;
  handlerBackground: string;
  handlerHoverBackground: string;
  handlerActiveBackground: string;

  selectionAreaBackground: string;
  selectionAreaBorderColor: string;
  lockedColor: string;
  referenceColor: string;
};
export type MiddlewareSelectorConfig = MiddlewareSelectorStyles & {
  afterDoubleClickMaterial?: (e: { material: Material }) => void;
};

// middleware text editor
export type MiddlewareTextEditorStyles = {
  zIndex: number;
  boxBorderColor: string;
};
export type MiddlewareTextEditorConfig = MiddlewareTextEditorStyles & {};

// middleware info
export type MiddlewareInfoStyles = {
  textBackground: string;
  textColor: string;
};
export type MiddlewareInfoConfig = MiddlewareInfoStyles & {};

// middleware ruler
export type MiddlewareRulerStyles = {
  background: string;
  stroke: string;
  scaleColor: string;
  textColor: string;
  gridColor: string;
  gridPrimaryColor: string;
  selectedAreaColor: string;
};
export type MiddlewareRulerConfig = MiddlewareRulerStyles & {};

// middleware scroller
export type MiddlewareScrollerStyles = {
  zIndex: number;
  thumbBackground: string;
  thumbBorderColor: string;
  hoverThumbBackground: string;
  hoverThumbBorderColor: string;
  activeThumbBackground: string;
  activeThumbBorderColor: string;
};
export type MiddlewareScrollerConfig = MiddlewareScrollerStyles & {};

// middleware layout selector
export type MiddlewareLayoutSelectorStyles = {
  zIndex: number;
  activeColor: string;

  handlerBorderColor: string;
  handlerBackground: string;
  handlerHoverBackground: string;
  handlerActiveBackground: string;
};
export type MiddlewareLayoutSelectorConfig = MiddlewareLayoutSelectorStyles & {};

// middleware path creator
export type MiddlewarePathCreatorStyles = {
  anchorSize: number;
  anchorBorderWidth: number;
  anchorBorderColor: string;
  anchorBackground: string;
  anchorHoverBorderColor: string;
  anchorHoverBackground: string;
  anchorActiveBorderColor: string;
  anchorActiveBackground: string;
};
export type MiddlewarePathCreatorConfig = MiddlewarePathCreatorStyles & {
  defaultStroke: string;
  defaultStrokeWidth: number;
};

// middleware path editor
export type MiddlewarePathEditorStyles = {
  zIndex: number;
  anchorSize: number;
  anchorSelectedSize: number;
  anchorBorderWidth: number;
  anchorBorderColor: string;
  anchorBackground: string;
  anchorHoverBorderColor: string;
  anchorHoverBackground: string;
  anchorActiveBorderColor: string;
  anchorActiveBackground: string;
  directorSize: number;
  directorBorderWidth: number;
  directorBorderColor: string;
  directorBackground: string;
  directorHoverBorderColor: string;
  directorHoverBackground: string;
  directorActiveBorderColor: string;
  directorActiveBackground: string;
  directorLineColor: string;
  helperStrokeColor: string;
  helperStrokeWidth: number;
};
export type MiddlewarePathEditorConfig = MiddlewarePathEditorStyles & {
  afterClickAway?: () => void;
};

// middleware creator
export type MiddlewareCreatorStyles = {
  zIndex: number;
  creationAreaBorderColor: string;
  // TODO
};
export type MiddlewareCreatorConfig = MiddlewareCreatorStyles & {
  selectAfterCreated?: boolean;
  afterCreated?: () => void;
};
