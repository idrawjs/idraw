import type { RecursivePartial, FlattenElement, Element, ModifyRecord } from '@idraw/types';
import { toFlattenElement, get } from '@idraw/util';

export function getModifyElementRecord(opts: {
  modifiedElement: RecursivePartial<Omit<Element, 'uuid'>> & Pick<Element, 'uuid'>;
  beforeElement: Element;
}): ModifyRecord<'modifyElement'> {
  const { modifiedElement, beforeElement } = opts;
  const { uuid, ...restElement } = modifiedElement;
  const after = toFlattenElement(restElement);
  let before: FlattenElement = {};
  Object.keys(after).forEach((key: string) => {
    let val = get(beforeElement, key);
    if (val === undefined && /(borderRadius|borderWidth)\[[0-9]{1,}\]$/.test(key)) {
      key = key.replace(/\[[0-9]{1,}\]$/, '');
      val = get(beforeElement, key);
    }
    before[key] = val;
  });
  before = toFlattenElement(before);

  const record: ModifyRecord<'modifyElement'> = {
    type: 'modifyElement',
    time: Date.now(),
    content: {
      method: 'modifyElement',
      uuid,
      before,
      after
    }
  };

  return record;
}
