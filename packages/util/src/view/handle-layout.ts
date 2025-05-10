import type { RecursivePartial, DataLayout } from '@idraw/types';
import { toFlattenLayout } from './modify-record';
import { set, del } from '../tool/get-set-del';

export function mergeLayout(
  originLayout: DataLayout,
  updateContent: RecursivePartial<DataLayout>,
  opts?: {
    strict?: boolean;
  }
): DataLayout {
  const updatedFlatten = toFlattenLayout(updateContent);
  const ignoreKeys: string[] = []; // TODO

  const updatedKeys = Object.keys(updatedFlatten);
  updatedKeys.forEach((key) => {
    if (!ignoreKeys.includes(key)) {
      const value = updatedFlatten[key];
      del(originLayout, key);
      if (value !== undefined) {
        set(originLayout, key, value);
      }
    }
  });

  if (opts?.strict === true) {
    const originFlatten = toFlattenLayout(originLayout);
    const originKeys = Object.keys(originFlatten);
    originKeys.forEach((key) => {
      if (!ignoreKeys.includes(key)) {
        if (!updatedKeys.includes(key)) {
          del(originLayout, key);
        }
      }
    });
  }

  return originLayout;
}
