import { createId, getMiddlewareValidStyles } from '@idraw/util';
import type { MiddlewareTextEditorStyles, MiddlewareTextEditorConfig } from '@idraw/types';

export const key = 'TEXT-EDITOR';

const prefix = `idraw-middleware-text-editor`;

export const getRootClassName = () => `${prefix}-${createId()}`;

export const defaultStyles: MiddlewareTextEditorStyles = {
  zIndex: 1,
  boxBorderColor: '#0c8ce9',
};

export const classNameMap = {
  textarea: `${prefix}-textarea`,
  hide: `${prefix}-hide`,
  canvasWrapper: `${prefix}-canvas-wrapper`,
};

export function getMiddlewareTextEditorStyles<C = MiddlewareTextEditorConfig, S = MiddlewareTextEditorStyles>(
  config: C
): S {
  const styles: S = getMiddlewareValidStyles<C, S>(config, ['zIndex', 'boxBorderColor']);
  return styles;
}
