import type { CoreOptions } from './core';

export interface IDrawSettings {
  enableScroll?: boolean;
  enableSelect?: boolean;
  enableScale?: boolean;
  enableRuler?: boolean;
  enableTextEdit?: boolean;
  enableDrag?: boolean;
}

export type IDrawOptions = CoreOptions & IDrawSettings;
