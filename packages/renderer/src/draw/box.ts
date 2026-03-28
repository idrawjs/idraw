import { StrictMaterial } from '@idraw/types';

export function getOpacity(mtrl: StrictMaterial): number {
  let opacity = 1;
  if (mtrl?.opacity !== undefined && mtrl?.opacity >= 0 && mtrl?.opacity <= 1) {
    opacity = mtrl?.opacity;
  }
  return opacity;
}
