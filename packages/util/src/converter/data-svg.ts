import { Data } from '@idraw/types';
import { calcMaterialListSize } from '@idraw/util';
import { materialToSVG } from './material-svg';

export function dataToSVG(data: Data): string {
  const { layout, materials } = data;
  const size = calcMaterialListSize(data.materials);
  let { x, y, width, height } = size;
  if (layout) {
    x = layout.x;
    y = layout.y;
    width = layout.width;
    height = layout.height;
  }
  let result = `<svg viewBox="0 0 ${width} ${height}">`;
  materials.forEach((mtrl) => {
    result += materialToSVG({
      ...mtrl,
      x: mtrl.x - x,
      y: mtrl.y - y,
    });
  });
  result += '</svg>';
  return result;
}
