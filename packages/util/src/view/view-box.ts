import type { Data, MaterialSize } from '@idraw/types';
import { calcMaterialListSize } from './material';

export function calcVisiableViewSize(data: Data): Omit<MaterialSize, 'angle'> {
  const outputSize = calcMaterialListSize(data.materials);
  if (data.layout) {
    if (data.layout?.overflow === 'hidden') {
      outputSize.x = data.layout.x;
      outputSize.y = data.layout.y;
      outputSize.width = data.layout.width;
      outputSize.height = data.layout.height;
    } else {
      outputSize.x = Math.min(outputSize.x, data.layout.x);
      outputSize.y = Math.min(outputSize.y, data.layout.y);
      outputSize.width = Math.max(outputSize.width, data.layout.width);
      outputSize.height = Math.max(outputSize.height, data.layout.height);
    }
  }
  return outputSize;
}
