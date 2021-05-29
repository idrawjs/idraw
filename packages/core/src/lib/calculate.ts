import {
  TypeElement,
  TypeElemDesc,
  TypePoint,
} from '@idraw/types';


export function translateRotateCenter(elem: TypeElement<keyof TypeElemDesc>): TypePoint {
  const p = {
    x: elem.x + elem.w / 2,
    y: elem.y + elem.h / 2,
  };
  return p;
}

export function translateRotateAngle(angle?: number) {
  if (typeof angle === 'number' && (angle > 0 || angle <= 0)) {
    const _angle = angle / 360 * (2 * Math.PI);
    return _angle;
  } else {
    return 0;
  }
}