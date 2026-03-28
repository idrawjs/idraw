import type { FlattenMaterial, Material, RecursivePartial, DataLayout, DataGlobal } from '@idraw/types';
import { flatObject } from '../tool/flat-object';

export function toFlattenMaterial(mtrl: Material | RecursivePartial<Material>): FlattenMaterial {
  return flatObject(mtrl, { ignorePaths: ['children'] });
}

export function toFlattenLayout(layout: DataLayout | RecursivePartial<DataLayout>): FlattenMaterial {
  return flatObject(layout);
}

export function toFlattenGlobal(global: DataGlobal | RecursivePartial<DataLayout>): FlattenMaterial {
  return flatObject(global);
}
