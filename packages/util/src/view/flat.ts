import type { StrictMaterial, MaterialSize, ViewRectVertexes } from '@idraw/types';
import { calcMaterialVertexesInGroup } from './vertex';
import { limitAngle, parseAngleToRadian, calcMaterialCenterFromVertexes, rotatePoint } from './rotate';

function flatMaterialSize(
  mtrlSize: MaterialSize,
  opts: {
    groupQueue: StrictMaterial<'group'>[];
  }
): MaterialSize {
  const { groupQueue } = opts;
  let { x, y } = mtrlSize;
  const { width, height, angle = 0 } = mtrlSize;
  let totalAngle = 0;
  groupQueue.forEach((group) => {
    x += group.x;
    y += group.y;
    totalAngle += group.angle || 0;
  });
  totalAngle = limitAngle(totalAngle);
  if (totalAngle === 0) {
    return {
      x,
      y,
      width,
      height,
      angle,
    };
  }
  totalAngle += mtrlSize.angle || 0;
  totalAngle = limitAngle(totalAngle);

  const vertexes = calcMaterialVertexesInGroup(mtrlSize, { groupQueue }) as ViewRectVertexes;
  const center = calcMaterialCenterFromVertexes(vertexes);
  const start = rotatePoint(center, vertexes[0], parseAngleToRadian(0 - totalAngle));
  x = start.x;
  y = start.y;
  return {
    x,
    y,
    width,
    height,
    angle: totalAngle,
  };
}

function isValidMaterial(mtrl: StrictMaterial) {
  if (['rect', 'circle'].includes(mtrl.type)) {
    const attributes = mtrl as StrictMaterial<'rect'>;
    if (!attributes.fill && !attributes.strokeWidth) {
      return false;
    }
    if (attributes.fill === 'transparent' && !attributes.strokeWidth) {
      return false;
    }
  }
  if (['group'].includes(mtrl.type)) {
    const attributes = mtrl as StrictMaterial<'group'>;
    const { children } = attributes;

    if (!(children.length > 0) && !attributes.fill && !attributes.strokeWidth) {
      return false;
    }
    if (!(children.length > 0) && attributes.fill === 'transparent' && !attributes.strokeWidth) {
      return false;
    }
  }
  if (mtrl.type === 'text') {
    if (!(mtrl as StrictMaterial<'text'>).text) {
      return false;
    }
  }

  if (mtrl.type === 'image') {
    if (!(mtrl as StrictMaterial<'image'>).href) {
      return false;
    }
  }

  if (mtrl.type === 'foreignObject') {
    if (!(mtrl as StrictMaterial<'foreignObject'>).content) {
      return false;
    }
  }

  if (mtrl.type === 'svgCode') {
    if (!(mtrl as StrictMaterial<'svgCode'>).code) {
      return false;
    }
  }

  if (mtrl.type === 'path') {
    const attributes = mtrl as StrictMaterial<'path'>;
    if (!(attributes?.commands?.length > 0)) {
      return false;
    }
  }

  return true;
}

export function flatMaterialList(list: StrictMaterial[]): StrictMaterial[] {
  const mtrleList: StrictMaterial[] = [];
  const currentGroupQueue: Array<StrictMaterial<'group'>> = [];

  const _resetMtrlSize = (mtrl: StrictMaterial) => {
    if (!isValidMaterial(mtrl)) {
      return;
    }
    const newSize = flatMaterialSize(mtrl, { groupQueue: currentGroupQueue });
    const resizeMtrl = {
      ...mtrl,
      ...newSize,
    };

    mtrleList.push(resizeMtrl);
  };

  const _walk = (mtrl: StrictMaterial) => {
    if (mtrl?.operations?.invisible === true) {
      return;
    }

    if (mtrl.type === 'group') {
      const attributes = mtrl as StrictMaterial<'group'>;
      const { children, ...restAttributes } = attributes;
      _resetMtrlSize({ ...mtrl, ...{ attributes: { ...restAttributes, children: [] } } });

      currentGroupQueue.push(mtrl as StrictMaterial<'group'>);
      children.forEach((child) => {
        _walk(child);
      });
      currentGroupQueue.pop();
    } else {
      _resetMtrlSize(mtrl);
    }
  };
  for (let i = 0; i < list.length; i++) {
    const mtrl = list[i];
    _walk(mtrl);
  }

  return mtrleList;
}
