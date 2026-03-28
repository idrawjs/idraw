import type { Material, MaterialPosition } from './material';
import type { RecursivePartial } from './util';

type ModifyInfoType = 'updateMaterial' | 'addMaterial' | 'deleteMaterial' | 'moveMaterial';

type ModifiedMaterial = Omit<RecursivePartial<Material>, 'id'>;

interface ModifyInfoContentMap {
  updateMaterial: {
    position: MaterialPosition;
    beforeModifiedMaterial: ModifiedMaterial;
    afterModifiedMaterial: ModifiedMaterial;
  };
  addMaterial: { position: MaterialPosition; material: Material };
  deleteMaterial: { position: MaterialPosition; material: Material };
  moveMaterial: { from: MaterialPosition; to: MaterialPosition };
}

export interface ModifyInfo<T extends ModifyInfoType = ModifyInfoType> {
  type: T;
  content: ModifyInfoContentMap[T];
}
