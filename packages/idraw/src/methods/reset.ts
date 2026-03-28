import type { IDrawSettings, IDrawStorage } from '@idraw/types';
import { Core } from '@idraw/core';
import { Store } from '@idraw/util';
import { IDrawEvent } from '../event';
import { parseSettings } from '../setting/config';
import { changeMode } from '../setting/mode';
import { changeStyles } from '../setting/style';

export function reset(
  depOptions: { core: Core<IDrawEvent>; store: Store<IDrawStorage> },
  opts: IDrawSettings
): IDrawSettings {
  const { core, store } = depOptions;
  const { mode, styles } = parseSettings(opts);
  let needFresh = false;
  const newOpts: IDrawSettings = {};
  store.clear();
  if (mode) {
    changeMode(mode, undefined, core, store);
    newOpts.mode = mode;
    needFresh = true;
  }

  if (styles) {
    changeStyles(styles, core, store);
    newOpts.styles = styles;
    needFresh = true;
  }

  if (needFresh === true) {
    core.refresh();
  }

  return newOpts;
}
