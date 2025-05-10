import type { RecursivePartial, DataGlobal } from '@idraw/types';
import { toFlattenGlobal } from './modify-record';
import { set, del } from '../tool/get-set-del';

export function mergeGlobal(
  originGlobal: DataGlobal,
  updateContent: RecursivePartial<DataGlobal>,
  opts?: {
    strict?: boolean;
  }
): DataGlobal {
  const updatedFlatten = toFlattenGlobal(updateContent);
  const ignoreKeys: string[] = []; // TODO

  const updatedKeys = Object.keys(updatedFlatten);
  updatedKeys.forEach((key) => {
    if (!ignoreKeys.includes(key)) {
      const value = updatedFlatten[key];
      del(originGlobal, key);
      if (value !== undefined) {
        set(originGlobal, key, value);
      }
    }
  });

  if (opts?.strict === true) {
    const originFlatten = toFlattenGlobal(originGlobal);
    const originKeys = Object.keys(originFlatten);
    originKeys.forEach((key) => {
      if (!ignoreKeys.includes(key)) {
        if (!updatedKeys.includes(key)) {
          del(originGlobal, key);
        }
      }
    });
  }

  return originGlobal;
}
