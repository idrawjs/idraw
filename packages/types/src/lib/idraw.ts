import type { CoreOptions } from './core';

export type IDrawOptions = CoreOptions & {
  disableScroll?: boolean;
  disableSelect?: boolean;
  disableScale?: boolean;
  disableRuler?: boolean;
  disableTextEdit?: boolean;
};
