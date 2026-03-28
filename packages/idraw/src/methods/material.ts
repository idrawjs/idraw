import type { Data, StrictMaterial, MaterialType, MaterialPosition, RecursivePartial } from '@idraw/types';
import { Core, coreEventKeys } from '@idraw/core';
import { IDrawEvent } from '../event';

export function createMaterial<T extends MaterialType = MaterialType>(
  depOptions: {
    core: Core<IDrawEvent>;
  },
  type: T,
  material: RecursivePartial<StrictMaterial<T>>,
  opts?: {
    viewCenter?: boolean;
  }
): StrictMaterial<T> {
  const { core } = depOptions;
  return core.createMaterial<T>(type, material, opts);
}

export function updateMaterial(
  depOptions: {
    core: Core<IDrawEvent>;
  },
  material: StrictMaterial
) {
  const { core } = depOptions;

  const modifyRecord = core.updateMaterial(material);
  if (!modifyRecord) {
    return;
  }
  const data = core.getData();
  if (!data) {
    return;
  }
  core.trigger(coreEventKeys.CHANGE, { data, type: 'updateMaterial', modifyRecord });
}

export function modifyMaterial(
  depOptions: {
    core: Core<IDrawEvent>;
  },
  material: RecursivePartial<Omit<StrictMaterial, 'id'>> & Pick<StrictMaterial, 'id'>
) {
  const { core } = depOptions;
  const modifyRecord = core.modifyMaterial(material);
  if (!modifyRecord) {
    return;
  }
  const data = core.getData();
  if (!data) {
    return;
  }
  core.trigger(coreEventKeys.CHANGE, { data, type: 'modifyMaterial', modifyRecord });
}

export function addMaterial(
  depOptions: {
    core: Core<IDrawEvent>;
  },
  material: StrictMaterial,
  opts?: {
    position: MaterialPosition;
  }
): Data {
  const { core } = depOptions;
  const modifyRecord = core.addMaterial(material, opts);
  const data = core.getData() as Data;
  core.trigger(coreEventKeys.CHANGE, { data, type: 'addMaterial', modifyRecord });
  return data;
}

export function deleteMaterial(depOptions: { core: Core<IDrawEvent> }, id: string) {
  const { core } = depOptions;
  const modifyRecord = core.deleteMaterial(id);
  const data = core.getData() as Data;
  core.trigger(coreEventKeys.CHANGE, { data, type: 'deleteMaterial', modifyRecord });
  core.trigger(coreEventKeys.CLEAR_SELECT, {});
}

export function moveMaterial(depOptions: { core: Core<IDrawEvent> }, id: string, to: MaterialPosition) {
  const { core } = depOptions;
  const modifyRecord = core.moveMaterial(id, to);
  const data = core.getData() as Data;
  core.trigger(coreEventKeys.CHANGE, { data, type: 'moveMaterial', modifyRecord });
}
