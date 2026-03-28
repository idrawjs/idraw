import type { ViewContext2D, Point, MaterialSize, ViewRectVertexes, StrictMaterial } from '@idraw/types';
import { calcDistance } from './point';
// import { calcMaterialVertexes } from './vertex';

export function parseRadianToAngle(radian: number): number {
  return (radian / Math.PI) * 180;
}

export function parseAngleToRadian(angle: number): number {
  return (angle / 180) * Math.PI;
}

// export function calcMaterialCenter(mtrl: MaterialSize): Point {
//   const p = {
//     x: mtrl.x + mtrl.w / 2,
//     y: mtrl.y + mtrl.h / 2
//   };
//   return p;
// }

export function rotateByCenter(
  ctx: ViewContext2D | CanvasRenderingContext2D | ViewContext2D,
  angle: number,
  center: Point,
  callback: (ctx: ViewContext2D | CanvasRenderingContext2D) => void
): void {
  const radian = parseAngleToRadian(angle || 0);
  if (center && (radian > 0 || radian < 0)) {
    ctx.translate(center.x, center.y);
    ctx.rotate(radian);
    ctx.translate(-center.x, -center.y);
  }
  callback(ctx);
  if (center && (radian > 0 || radian < 0)) {
    ctx.translate(center.x, center.y);
    ctx.rotate(-radian);
    ctx.translate(-center.x, -center.y);
  }
}

export function rotateMaterial(
  ctx: ViewContext2D | CanvasRenderingContext2D | ViewContext2D,
  mtrlSize: MaterialSize,
  callback: (ctx: ViewContext2D | CanvasRenderingContext2D) => void
): void {
  const center = calcMaterialCenter(mtrlSize);
  rotateByCenter(ctx, mtrlSize.angle || 0, center, () => {
    callback(ctx);
  });
}

export function calcMaterialCenter(mtrl: MaterialSize): Point {
  const p = {
    x: mtrl.x + mtrl.width / 2,
    y: mtrl.y + mtrl.height / 2,
  };
  return p;
}

export function calcMaterialCenterFromVertexes(ves: ViewRectVertexes): Point {
  const startX = Math.min(ves[0].x, ves[1].x, ves[2].x, ves[3].x);
  const startY = Math.min(ves[0].y, ves[1].y, ves[2].y, ves[3].y);
  const endX = Math.max(ves[0].x, ves[1].x, ves[2].x, ves[3].x);
  const endY = Math.max(ves[0].y, ves[1].y, ves[2].y, ves[3].y);
  const mtrlSize = {
    x: startX,
    y: startY,
    width: endX - startX,
    height: endY - startY,
  };
  return calcMaterialCenter(mtrlSize);
}

export function calcRadian(center: Point, start: Point, end: Point): number {
  const startRadian = calcLineRadian(center, start);
  const endRadian = calcLineRadian(center, end);

  if (endRadian !== null && startRadian !== null) {
    // if (startRadian > (Math.PI * 3) / 2 && endRadian < Math.PI / 2) {
    //   return endRadian + (Math.PI * 2 - startRadian);
    // } else if (endRadian > (Math.PI * 3) / 2 && startRadian < Math.PI / 2) {
    //   return startRadian + (Math.PI * 2 - endRadian);
    // } else {
    //   return endRadian - startRadian;
    // }
    return endRadian - startRadian;
  } else {
    return 0;
  }
}

function calcLineRadian(center: Point, p: Point): number {
  const x = p.x - center.x;
  const y = p.y - center.y;
  if (x === 0) {
    if (y < 0) {
      return 0;
    } else if (y > 0) {
      return Math.PI;
    }
  } else if (y === 0) {
    if (x < 0) {
      return (Math.PI * 3) / 2;
    } else if (x > 0) {
      return Math.PI / 2;
    }
  }

  if (x > 0 && y < 0) {
    return Math.atan(Math.abs(x) / Math.abs(y));
  } else if (x > 0 && y > 0) {
    return Math.PI - Math.atan(Math.abs(x) / Math.abs(y));
  } else if (x < 0 && y > 0) {
    return Math.PI + Math.atan(Math.abs(x) / Math.abs(y));
  } else if (x < 0 && y < 0) {
    return 2 * Math.PI - Math.atan(Math.abs(x) / Math.abs(y));
  }

  return 0;
}

export function rotatePoint(center: Point, start: Point, radian: number): Point {
  const startRadian = calcLineRadian(center, start);

  const rotateRadian = radian;

  let endRadian = startRadian + rotateRadian;
  if (endRadian > Math.PI * 2) {
    endRadian = endRadian - Math.PI * 2;
  } else if (endRadian < 0 - Math.PI * 2) {
    endRadian = endRadian + Math.PI * 2;
  }
  if (endRadian < 0) {
    endRadian = endRadian + Math.PI * 2;
  }

  const length = calcDistance(center, start);
  let x = 0;
  let y = 0;
  if (endRadian === 0) {
    x = 0;
    y = 0 - length;
  } else if (endRadian > 0 && endRadian < Math.PI / 2) {
    x = Math.sin(endRadian) * length;
    y = 0 - Math.cos(endRadian) * length;
  } else if (endRadian === Math.PI / 2) {
    x = length;
    y = 0;
  } else if (endRadian > Math.PI / 2 && endRadian < Math.PI) {
    x = Math.sin(Math.PI - endRadian) * length;
    y = Math.cos(Math.PI - endRadian) * length;
  } else if (endRadian === Math.PI) {
    x = 0;
    y = length;
  } else if (endRadian > Math.PI && endRadian < (3 / 2) * Math.PI) {
    x = 0 - Math.sin(endRadian - Math.PI) * length;
    y = Math.cos(endRadian - Math.PI) * length;
  } else if (endRadian === (3 / 2) * Math.PI) {
    x = 0 - length;
    y = 0;
  } else if (endRadian > (3 / 2) * Math.PI && endRadian < 2 * Math.PI) {
    x = 0 - Math.sin(2 * Math.PI - endRadian) * length;
    y = 0 - Math.cos(2 * Math.PI - endRadian) * length;
  } else if (endRadian === 2 * Math.PI) {
    x = 0;
    y = 0 - length;
  }

  x += center.x;
  y += center.y;
  return { x, y };
}

export function rotatePointInGroup(point: Point, groupQueue: StrictMaterial<'group'>[]): Point {
  if (groupQueue?.length > 0) {
    let resultX = point.x;
    let resultY = point.y;
    groupQueue.forEach((group) => {
      const { x, y, width, height, angle = 0 } = group;
      const center = calcMaterialCenter({ x, y, width, height, angle });
      const temp = rotatePoint(center, { x: resultX, y: resultY }, parseAngleToRadian(angle));
      resultX = temp.x;
      resultY = temp.y;
    });
    return {
      x: resultX,
      y: resultY,
    };
  }
  return point;
}

export function getMaterialRotateVertexes(mtrlSize: MaterialSize, center: Point, angle: number): ViewRectVertexes {
  const { x, y, width, height } = mtrlSize;
  let p1 = { x, y };
  let p2 = { x: x + width, y };
  let p3 = { x: x + width, y: y + height };
  let p4 = { x, y: y + height };
  if (angle && (angle > 0 || angle < 0)) {
    const radian = parseAngleToRadian(limitAngle(angle));
    p1 = rotatePoint(center, p1, radian);
    p2 = rotatePoint(center, p2, radian);
    p3 = rotatePoint(center, p3, radian);
    p4 = rotatePoint(center, p4, radian);
  }
  return [p1, p2, p3, p4];
}

export function rotateMaterialVertexes(mtrlSize: MaterialSize): ViewRectVertexes {
  const { angle = 0 } = mtrlSize;
  const center = calcMaterialCenter(mtrlSize);
  return getMaterialRotateVertexes(mtrlSize, center, angle);
}

export function rotateVertexes(center: Point, ves: ViewRectVertexes, radian: number): ViewRectVertexes {
  return [
    rotatePoint(center, { x: ves[0].x, y: ves[0].y }, radian),
    rotatePoint(center, { x: ves[1].x, y: ves[1].y }, radian),
    rotatePoint(center, { x: ves[2].x, y: ves[2].y }, radian),
    rotatePoint(center, { x: ves[3].x, y: ves[3].y }, radian),
  ];
}

// [0, 360], eg. 370 to 10, -10 to 350
export function limitAngle(angle: number): number {
  if (!(angle > 0 || angle < 0) || angle === 0 || angle === 360) {
    return 0;
  }
  let num = angle % 360;
  if (num < 0) {
    num += 360;
  } else if (angle === 360) {
    num = 0;
  }
  return num;
}
