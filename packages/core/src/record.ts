import type { RecursivePartial, FlattenMaterial, Material, ModifyRecord } from '@idraw/types';
import { toFlattenMaterial, get } from '@idraw/util';

export function getModifyMaterialRecord(opts: {
  modifiedMaterial: RecursivePartial<Omit<Material, 'id'>> & Pick<Material, 'id'>;
  beforeMaterial: Material;
}): ModifyRecord<'modifyMaterial'> {
  const { modifiedMaterial, beforeMaterial } = opts;
  const { id, ...restMaterial } = modifiedMaterial;
  const after = toFlattenMaterial(restMaterial);
  let before: FlattenMaterial = {};
  Object.keys(after).forEach((key: string) => {
    let val = get(beforeMaterial, key);
    if (val === undefined && /(cornerRadius|strokeWidth)\[[0-9]{1,}\]$/.test(key)) {
      key = key.replace(/\[[0-9]{1,}\]$/, '');
      val = get(beforeMaterial, key);
    }
    before[key] = val;
  });
  before = toFlattenMaterial(before);

  const record: ModifyRecord<'modifyMaterial'> = {
    type: 'modifyMaterial',
    time: Date.now(),
    content: {
      method: 'modifyMaterial',
      id,
      before,
      after,
    },
  };

  return record;
}
