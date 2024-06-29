import type { BoardMiddlewareObject, BoardMiddleware } from './board';

export type Middleware = BoardMiddleware;

export type MiddlewareObject = BoardMiddlewareObject;

export type MiddlewareSelectorStyle = {
  activeColor: string;
  activeAreaColor: string;
  lockedColor: string;
  referenceColor: string;
};
export type MiddlewareSelectorConfig = MiddlewareSelectorStyle & {};

export type MiddlewareInfoStyle = {
  textBackground: string;
  textColor: string;
};

export type MiddlewareInfoConfig = MiddlewareInfoStyle & {};

export type MiddlewareRulerStyle = {
  background: string;
  borderColor: string;
  scaleColor: string;
  textColor: string;
  gridColor: string;
  gridPrimaryColor: string;
  selectedAreaColor: string;
};

export type MiddlewareRulerConfig = MiddlewareRulerStyle & {};

export type MiddlewareScrollerStyle = {
  thumbBackground: string;
  thumbBorderColor: string;
  hoverThumbBackground: string;
  hoverThumbBorderColor: string;
  activeThumbBackground: string;
  activeThumbBorderColor: string;
};

export type MiddlewareScrollerConfig = MiddlewareScrollerStyle & {};
