import type { Point, PointSize, TouchPoint } from '@idraw/types';

export function calcDistance(start: PointSize, end: PointSize) {
  const distance = (start.x - end.x) * (start.x - end.x) + (start.y - end.y) * (start.y - end.y);
  return distance === 0 ? distance : Math.sqrt(distance);
}

export function calcSpeed(start: Point, end: Point) {
  const distance = calcDistance(start, end);
  const speed = distance / Math.abs(end.t - start.t);
  return speed;
}

export function equalPoint(p1: Point, p2: Point) {
  return p1.x === p2.x && p1.y === p2.y && p1.t === p2.t;
}

export function equalTouchPoint(p1: TouchPoint, p2: TouchPoint) {
  return equalPoint(p1, p2) === true && p1.f === p2.f;
}

function isNum(num: any): boolean {
  return num >= 0 || num < 0;
}

export function vaildPoint(p: Point) {
  return isNum(p.x) && isNum(p.y) && p.t > 0;
}

export function vaildTouchPoint(p: TouchPoint) {
  return vaildPoint(p) === true && p.f >= 0;
}

export function getCenterFromTwoPoints(p1: PointSize, p2: PointSize): PointSize {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}
