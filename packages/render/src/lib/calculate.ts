import {
  TypeElement,
  TypeElemDesc,
  TypePoint,
} from '@idraw/types';


export function parseRadianToAngle(radian: number): number {
  return radian / Math.PI * 180;
}

export function parseAngleToRadian(angle: number): number {
  return angle / 180 * Math.PI;
}

export function calcElementCenter(elem: TypeElement<keyof TypeElemDesc>): TypePoint {
  const p = {
    x: elem.x + elem.w / 2,
    y: elem.y + elem.h / 2,
  };
  return p;
}


export function calcRadian(center: TypePoint, start: TypePoint, end: TypePoint): number {
  const startAngle = calcLineAngle(center, start);
  const endAngle = calcLineAngle(center, end);
  if (endAngle !== null && startAngle !== null ) {
    if (startAngle > Math.PI * 3 / 2  && endAngle < Math.PI / 2) {
      return endAngle + (Math.PI * 2 - startAngle);
    } else if (endAngle > Math.PI * 3 / 2  && startAngle < Math.PI / 2) {
      return startAngle + (Math.PI * 2 - endAngle);
    } else {
      return endAngle - startAngle;
    }
  } else {
    return 0;
  }
}

function calcLineAngle(center: TypePoint, p: TypePoint): number | null {
  const x = p.x - center.x;
  const y = center.y - p.y;
  if (x === 0) {
    if (y < 0) {
      return Math.PI / 2;
    } else if (y > 0) {
      return Math.PI * ( 3 / 2 );
    }
  } else if (y === 0) {
    if (x < 0) {
      return Math.PI;
    } else if (x > 0) {
      return 0;
    }
  }
  if (x > 0 && y < 0) {
    return Math.atan(Math.abs(y) / Math.abs(x));
  } else if (x < 0 && y < 0) {
    return Math.PI - Math.atan(Math.abs(y) / Math.abs(x));
  } else if (x < 0 && y > 0) {
    return Math.PI + Math.atan(Math.abs(y) / Math.abs(x));
  } else if (x > 0 && y > 0) {
    return Math.PI * 2 - Math.atan(Math.abs(y) / Math.abs(x));
  }
  return null;
}