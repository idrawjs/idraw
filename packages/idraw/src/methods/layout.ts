import type { Data, DataLayout, RecursivePartial } from '@idraw/types';
import { Core, coreEventKeys } from '@idraw/core';
import { IDrawEvent } from '../event';

export function modifyLayout(depOptions: { core: Core<IDrawEvent> }, layout: RecursivePartial<DataLayout> | null) {
  const { core } = depOptions;
  const modifyRecord = core.modifyLayout(layout);
  const data = core.getData() as Data;
  core.trigger(coreEventKeys.CHANGE, { data, type: 'modifyLayout', modifyRecord });
}
