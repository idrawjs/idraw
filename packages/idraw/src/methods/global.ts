import type { Data, DataGlobal, RecursivePartial } from '@idraw/types';
import { Core, coreEventKeys } from '@idraw/core';
import { IDrawEvent } from '../event';

export function modifyGlobal(depOptions: { core: Core<IDrawEvent> }, global: RecursivePartial<DataGlobal> | null) {
  const { core } = depOptions;
  const modifyRecord = core.modifyGlobal(global);
  const data = core.getData() as Data;
  core.trigger(coreEventKeys.CHANGE, { data, type: 'modifyGlobal', modifyRecord });
}
