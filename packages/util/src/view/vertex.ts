import { Point, StrictMaterial, MaterialSize, ViewRectVertexes } from '@idraw/types';
import {
  getMaterialRotateVertexes,
  calcMaterialCenter,
  parseAngleToRadian,
  rotateVertexes,
  calcMaterialCenterFromVertexes,
} from './rotate';

export function getMaterialVertexes(mtrlSize: MaterialSize): ViewRectVertexes {
  const { x, y, height, width } = mtrlSize;
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
}

export function calcMaterialVertexes(mtrlSize: MaterialSize) {
  const { x, y, width, height, angle = 0 } = mtrlSize;
  if (angle === 0) {
    return getMaterialVertexes(mtrlSize);
  }
  return getMaterialRotateVertexes(mtrlSize, calcMaterialCenter({ x, y, width, height, angle }), angle);
}

export function calcMaterialQueueVertexesQueueInGroup(groupQueue: MaterialSize[]): ViewRectVertexes[] {
  const vesList: ViewRectVertexes[] = [];
  let totalX = 0;
  let totalY = 0;

  const rotateActionList: Array<{
    center: Point;
    angle: number;
    radian: number;
  }> = [];

  const mtrlQueue = [...groupQueue];
  for (let i = 0; i < mtrlQueue.length; i++) {
    const { x, y, width, height, angle = 0 } = mtrlQueue[i];
    totalX += x;
    totalY += y;
    let ves: [Point, Point, Point, Point];
    if (i === 0) {
      const mtrlSize: MaterialSize = { x: totalX, y: totalY, width, height, angle };
      ves = calcMaterialVertexes({ x, y, width, height, angle });
      rotateActionList.push({
        center: calcMaterialCenter(mtrlSize),
        angle,
        radian: parseAngleToRadian(angle),
      });
    } else {
      const mtrlSize: MaterialSize = { x: totalX, y: totalY, width, height, angle };
      ves = getMaterialVertexes(mtrlSize);
      for (let aIdx = 0; aIdx < rotateActionList.length; aIdx++) {
        const { center, radian } = rotateActionList[aIdx];
        ves = rotateVertexes(center, ves, radian);
      }
      const vesCenter = calcMaterialCenterFromVertexes(ves);
      if (angle > 0 || angle < 0) {
        const radian = parseAngleToRadian(angle);
        ves = rotateVertexes(vesCenter, ves, radian);
      }
      rotateActionList.push({
        center: vesCenter,
        angle,
        radian: parseAngleToRadian(angle),
      });
    }

    vesList.push(ves);
  }
  return vesList;
}

export function calcMaterialVertexesQueueInGroup(
  targetMtrl: MaterialSize,
  opts: { groupQueue: StrictMaterial<'group'>[] }
): ViewRectVertexes[] {
  const { groupQueue } = opts;
  if (!(groupQueue.length > 0)) {
    return [calcMaterialVertexes(targetMtrl)];
  }
  const mtrlQueue = [...groupQueue, ...[targetMtrl]];
  const vesList = calcMaterialQueueVertexesQueueInGroup(mtrlQueue);
  return vesList;
}

export function calcMaterialVertexesInGroup(
  targetMtrl: MaterialSize,
  opts: { groupQueue: StrictMaterial<'group'>[] }
): ViewRectVertexes | null {
  const vesList = calcMaterialVertexesQueueInGroup(targetMtrl, opts);
  const ves = vesList.pop();
  return ves || null;
}
