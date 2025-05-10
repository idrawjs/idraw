import type { IDrawFeature, IDrawStorage } from '@idraw/types';
import { Core, coreEventKeys } from '@idraw/core';
import { Store } from '@idraw/util';
import { IDrawEvent } from '../event';
import { runMiddlewares } from '../setting/mode';

export function setFeature(
  depOptions: { core: Core<IDrawEvent>; store: Store<IDrawStorage> },
  feat: IDrawFeature,
  status: boolean
) {
  const { core, store } = depOptions;
  if (['ruler', 'scroll', 'scale', 'info'].includes(feat)) {
    const map: Record<IDrawFeature | string, keyof Omit<IDrawStorage, 'mode'>> = {
      ruler: 'enableRuler',
      scroll: 'enableScroll',
      scale: 'enableScale',
      info: 'enableInfo'
    };
    store.set(map[feat], !!status);
    runMiddlewares(core, store);
    core.refresh();
  } else if (feat === 'selectInGroup') {
    core.trigger(coreEventKeys.SELECT_IN_GROUP, {
      enable: !!status
    });
  } else if (feat === 'snapToGrid') {
    core.trigger(coreEventKeys.SNAP_TO_GRID, {
      enable: !!status
    });
  }
}
