import {
  calcMaterialCenter,
  rotateMaterialVertexes,
  calcMaterialVertexesInGroup,
  // calcMaterialQueueVertexesQueueInGroup,
  calcViewPoint,
  calcViewMaterialSize,
  rotatePoint,
  parseAngleToRadian,
  parseRadianToAngle,
  limitAngle,
  calcRadian,
} from '@idraw/util';
import type {
  ViewRectVertexes,
  // MaterialSizeController,
  StoreSharer,
  ViewScaleInfo,
  ViewSizeInfo,
  ViewCalculator,
  MaterialOperations,
  StrictMaterial,
} from '@idraw/types';
import type {
  Data,
  ViewContext2D,
  Point,
  PointTarget,
  PointTargetType,
  MaterialType,
  MaterialSize,
  ResizeType,
  AreaSize,
} from './types';
import { ATTR_HANDLER_TYPE } from './static';

// import { keyDebugMtrlCenter, keyDebugEnd0, keyDebugEndHorizontal, keyDebugEndVertical, keyDebugStartHorizontal, keyDebugStartVertical } from './config';

function parseRadian(angle: number) {
  return (angle * Math.PI) / 180;
}

function calcMoveDist(moveX: number, moveY: number) {
  return Math.sqrt(moveX * moveX + moveY * moveY);
}

function changeMoveDistDirect(moveDist: number, moveDirect: number) {
  return moveDirect > 0 ? Math.abs(moveDist) : 0 - Math.abs(moveDist);
}

function isPointInViewActiveVertexes(
  p: Point,
  opts: { ctx: ViewContext2D; vertexes: ViewRectVertexes; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): boolean {
  const { ctx, viewScaleInfo, vertexes } = opts;
  const v0 = calcViewPoint(vertexes[0], { viewScaleInfo });
  const v1 = calcViewPoint(vertexes[1], { viewScaleInfo });
  const v2 = calcViewPoint(vertexes[2], { viewScaleInfo });
  const v3 = calcViewPoint(vertexes[3], { viewScaleInfo });
  ctx.beginPath();
  ctx.moveTo(v0.x, v0.y);
  ctx.lineTo(v1.x, v1.y);
  ctx.lineTo(v2.x, v2.y);
  ctx.lineTo(v3.x, v3.y);

  ctx.lineTo(v0.x, v0.y);
  ctx.closePath();
  if (ctx.isPointInPath(p.x, p.y)) {
    return true;
  }
  return false;
}

export function getPointTarget(
  p: Point,
  opts: {
    ctx: ViewContext2D;
    data?: Data | null;
    selectedMaterials?: StrictMaterial<MaterialType>[];
    areaSize?: AreaSize | null;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    calculator: ViewCalculator;
    groupQueue: StrictMaterial<'group'>[] | null;
    nativeEvent: Event;
  }
): PointTarget {
  const target: PointTarget = {
    type: null,
    materials: [],
    materialVertexesList: [],
    groupQueue: [],
  };
  const { ctx, data, calculator, selectedMaterials, viewScaleInfo, viewSizeInfo, areaSize, groupQueue, nativeEvent } =
    opts;

  const $targetElement = nativeEvent.target as HTMLElement | null;

  // resize
  if (selectedMaterials && selectedMaterials?.length === 1 && $targetElement) {
    const $elem = $targetElement;
    if ($elem?.hasAttribute(ATTR_HANDLER_TYPE)) {
      const handlerType = $elem.getAttribute(ATTR_HANDLER_TYPE);
      if (
        typeof handlerType === 'string'
        // TODO
        // !(selectedMaterials?.[0]?.operations?.rotatable === false && handlerType === 'rotate')
      ) {
        target.type = `resize-${handlerType}` as PointTargetType;
        target.groupQueue = groupQueue || [];
        target.materials = [selectedMaterials[0]];
        return target;
      }
    }
  }

  // in group
  if (groupQueue && Array.isArray(groupQueue) && groupQueue.length > 0) {
    // return target;
    const lastGroup = groupQueue[groupQueue.length - 1];
    if (lastGroup?.children && Array.isArray(lastGroup?.children)) {
      for (let i = lastGroup.children.length - 1; i >= 0; i--) {
        const child = lastGroup.children[i];
        // if (child?.operations?.invisible === true) {
        //   continue;
        // }
        const vertexes = calcMaterialVertexesInGroup(child, { groupQueue });
        if (vertexes && isPointInViewActiveVertexes(p, { ctx, vertexes, viewScaleInfo, viewSizeInfo })) {
          if (!target.type) {
            target.type = 'over-material';
          }
          target.groupQueue = groupQueue;
          target.materials = [child];
          return target;
        }
      }
    }
    return target;
  }

  if (target.type !== null) {
    return target;
  }

  // list area
  if (areaSize && Array.isArray(selectedMaterials) && selectedMaterials?.length > 1) {
    const { x, y, width, height } = areaSize;
    if (p.x >= x && p.x <= x + width && p.y >= y && p.y <= y + height) {
      target.type = 'list-area';
      target.materials = selectedMaterials;
      return target;
    }
  }

  // over-material
  if (data) {
    const { index, material } = calculator.getPointMaterial(p as Point, { data, viewScaleInfo, viewSizeInfo });
    if (index >= 0 && material && material?.operations?.invisible !== true) {
      target.materials = [material];
      target.type = 'over-material';
      return target;
    }
  }

  return target;
}

export function resizeMaterial(
  mtrl: MaterialSize & { operations?: MaterialOperations },
  opts: {
    start: Point;
    end: Point;
    resizeType: ResizeType;
    scale: number;
    sharer: StoreSharer;
    calculator: ViewCalculator;
  }
): MaterialSize {
  let { x, y, width, height, angle = 0 } = mtrl;
  const mtrlCenter = calcMaterialCenter({ x, y, width, height, angle });

  angle = limitAngle(angle);
  const radian = parseAngleToRadian(angle);
  const limitRatio = !!mtrl?.operations?.limitRatio;
  const { start, end, resizeType, scale, calculator } = opts;

  let start0: Point = { ...start };
  let end0: Point = { ...end };
  let startHorizontal0 = { x: start0.x, y: mtrlCenter.y };
  let endHorizontal0 = { x: end0.x, y: mtrlCenter.y };
  let startHorizontal = { ...startHorizontal0 };
  let endHorizontal = { ...endHorizontal0 };
  let startVertical0 = { x: mtrlCenter.x, y: start0.y };
  let endVertical0 = { x: mtrlCenter.x, y: end0.y };
  let startVertical = { ...startVertical0 };
  let endVertical = { ...endVertical0 };

  let moveHorizontalX = (endHorizontal.x - startHorizontal.x) / scale;
  let moveHorizontalY = (endHorizontal.y - startHorizontal.y) / scale;
  let moveHorizontalDist = calcMoveDist(moveHorizontalX, moveHorizontalY);
  // let centerMoveHorizontalDist = 0;

  let moveVerticalX = (endVertical.x - startVertical.x) / scale;
  let moveVerticalY = (endVertical.y - startVertical.y) / scale;
  let moveVerticalDist = calcMoveDist(moveVerticalX, moveVerticalY);
  // let centerMoveVerticalDist = 0;

  if (angle > 0 || angle < 0) {
    start0 = rotatePoint(mtrlCenter, start, 0 - radian);
    end0 = rotatePoint(mtrlCenter, end, 0 - radian);

    startHorizontal0 = { x: start0.x, y: mtrlCenter.y };
    endHorizontal0 = { x: end0.x, y: mtrlCenter.y };
    startHorizontal = rotatePoint(mtrlCenter, startHorizontal0, radian);
    endHorizontal = rotatePoint(mtrlCenter, endHorizontal0, radian);

    startVertical0 = { x: mtrlCenter.x, y: start0.y };
    endVertical0 = { x: mtrlCenter.x, y: end0.y };
    startVertical = rotatePoint(mtrlCenter, startVertical0, radian);
    endVertical = rotatePoint(mtrlCenter, endVertical0, radian);

    moveHorizontalX = (endHorizontal.x - startHorizontal.x) / scale;
    moveHorizontalY = (endHorizontal.y - startHorizontal.y) / scale;
    moveHorizontalDist = calcMoveDist(moveHorizontalX, moveHorizontalY);
    moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, moveHorizontalY);
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // centerMoveHorizontalDist = moveHorizontalDist / 2;

    moveVerticalX = (endVertical.x - startVertical.x) / scale;
    moveVerticalY = (endVertical.y - startVertical.y) / scale;
    moveVerticalDist = calcMoveDist(moveVerticalX, moveVerticalY);
    moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // centerMoveVerticalDist = moveVerticalDist / 2;
  }

  let moveX = (end.x - start.x) / scale;
  let moveY = (end.y - start.y) / scale;

  if (limitRatio === true) {
    // TODO
    if (['resize-top', 'resize-bottom', 'resize-left', 'resize-right'].includes(resizeType)) {
      const maxDist = Math.max(Math.abs(moveX), Math.abs(moveY));
      moveX = (moveX >= 0 ? 1 : -1) * maxDist;
      moveY = (((moveY >= 0 ? 1 : -1) * maxDist) / mtrl.width) * mtrl.height;

      const maxVerticalDist = Math.max(Math.abs(moveVerticalX), Math.abs(moveVerticalY));
      moveVerticalX = (moveVerticalX >= 0 ? 1 : -1) * maxVerticalDist;
      moveVerticalY = (((moveVerticalY >= 0 ? 1 : -1) * maxVerticalDist) / mtrl.width) * mtrl.height;

      const maxHorizontalDist = Math.max(Math.abs(moveHorizontalX), Math.abs(moveHorizontalY));
      moveHorizontalX = (moveHorizontalX >= 0 ? 1 : -1) * maxHorizontalDist;
      moveHorizontalY = (((moveHorizontalY >= 0 ? 1 : -1) * maxHorizontalDist) / mtrl.width) * mtrl.height;
    } else if (
      ['resize-top-left', 'resize-top-right', 'resize-bottom-left', 'resize-bottom-right'].includes(resizeType)
    ) {
      {
        // const maxDist = Math.max(Math.abs(moveX), Math.abs(moveY));
        const maxDist = Math.abs(moveX);
        moveX = (moveX >= 0 ? 1 : -1) * maxDist;
        const moveYLeng = (maxDist / mtrl.width) * mtrl.height;
        if (resizeType === 'resize-top-left' || resizeType === 'resize-bottom-right') {
          moveY = moveX > 0 ? moveYLeng : -moveYLeng;
        } else if (resizeType === 'resize-top-right' || resizeType === 'resize-bottom-left') {
          moveY = moveX > 0 ? -moveYLeng : moveYLeng;
        }
      }

      {
        moveHorizontalDist = Math.abs(moveHorizontalDist);
        moveVerticalDist = (moveHorizontalDist / mtrl.width) * mtrl.height;
      }
    }
  }

  switch (resizeType) {
    case 'resize-top': {
      if (angle === 0) {
        if (height - moveY > 0) {
          y += moveY;
          height -= moveY;
          if (mtrl.operations?.limitRatio === true) {
            x += ((moveY / mtrl.height) * mtrl.width) / 2;
            width -= (moveY / mtrl.height) * mtrl.width;
          }
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = mtrlCenter.x;
        let centerY = mtrlCenter.y;
        if (angle < 90) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          const radian = parseRadian(angle);
          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY - centerMoveVerticalDist * Math.cos(radian);
        } else if (angle < 180) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          const radian = parseRadian(angle - 90);
          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY + centerMoveVerticalDist * Math.sin(radian);
        } else if (angle < 270) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          const radian = parseRadian(angle - 180);
          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY + centerMoveVerticalDist * Math.cos(radian);
        } else if (angle < 360) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          const radian = parseRadian(angle - 270);
          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY - centerMoveVerticalDist * Math.sin(radian);
        }
        if (height + moveVerticalDist > 0) {
          if (mtrl.operations?.limitRatio === true) {
            width = width + (moveVerticalDist / mtrl.height) * mtrl.width;
          }
          height = height + moveVerticalDist;
          x = centerX - width / 2;
          y = centerY - height / 2;
        }
      }
      break;
    }
    case 'resize-bottom': {
      if (angle === 0) {
        if (mtrl.height + moveY > 0) {
          height += moveY;
          if (mtrl.operations?.limitRatio === true) {
            x -= ((moveY / mtrl.height) * mtrl.width) / 2;
            width += (moveY / mtrl.height) * mtrl.width;
          }
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = mtrlCenter.x;
        let centerY = mtrlCenter.y;
        if (angle < 90) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          const radian = parseRadian(angle);
          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY + centerMoveVerticalDist * Math.cos(radian);
        } else if (angle < 180) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          const radian = parseRadian(angle - 90);
          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY - centerMoveVerticalDist * Math.sin(radian);
        } else if (angle < 270) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          const radian = parseRadian(angle - 180);
          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY - centerMoveVerticalDist * Math.cos(radian);
        } else if (angle < 360) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
        }
        if (height + moveVerticalDist > 0) {
          if (mtrl.operations?.limitRatio === true) {
            width = width + (moveVerticalDist / mtrl.height) * mtrl.width;
          }
          height = height + moveVerticalDist;
          x = centerX - width / 2;
          y = centerY - height / 2;
        }
      }
      break;
    }
    case 'resize-left': {
      if (angle === 0) {
        if (mtrl.width - moveX > 0) {
          x += moveX;
          width -= moveX;
          if (mtrl.operations?.limitRatio === true) {
            height -= (moveX / mtrl.width) * mtrl.height;
            y += ((moveX / mtrl.width) * mtrl.height) / 2;
          }
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = mtrlCenter.x;
        let centerY = mtrlCenter.y;
        if (angle < 90) {
          moveHorizontalDist = 0 - changeMoveDistDirect(moveHorizontalDist, moveHorizontalX);
          const radian = parseRadian(angle);
          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 180) {
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, moveHorizontalX);
          const radian = parseRadian(angle - 90);
          const centerMoveDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 270) {
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, moveHorizontalY);
          const radian = parseRadian(angle - 180);
          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 360) {
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, moveHorizontalY);
          const radian = parseRadian(angle - 270);
          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.cos(radian);
        }
        if (width + moveHorizontalDist > 0) {
          if (mtrl.operations?.limitRatio === true) {
            height = height + (moveHorizontalDist / mtrl.width) * mtrl.height;
          }
          width = width + moveHorizontalDist;
          x = centerX - width / 2;
          y = centerY - height / 2;
        }
      }
      break;
    }
    case 'resize-right': {
      if (angle === 0) {
        if (mtrl.width + moveX > 0) {
          width += moveX;
          if (mtrl.operations?.limitRatio === true) {
            y -= (moveX * mtrl.height) / mtrl.width / 2;
            height += (moveX * mtrl.height) / mtrl.width;
          }
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = mtrlCenter.x;
        let centerY = mtrlCenter.y;
        if (angle < 90) {
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, moveHorizontalY);
          const radian = parseRadian(angle);
          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 180) {
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, moveY);
          const radian = parseRadian(angle - 90);
          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.cos(radian);
        } else if (angle < 270) {
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, moveY);
          const radian = parseRadian(angle - 180);
          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.sin(radian);
          moveHorizontalDist = 0 - moveHorizontalDist;
        } else if (angle < 360) {
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, moveX);
          const radian = parseRadian(angle - 270);
          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.cos(radian);
        }
        if (width + moveHorizontalDist > 0) {
          if (mtrl.operations?.limitRatio === true) {
            height = height + (moveHorizontalDist / mtrl.width) * mtrl.height;
          }
          width = width + moveHorizontalDist;
          x = centerX - width / 2;
          y = centerY - height / 2;
        }
      }
      break;
    }
    case 'resize-top-left': {
      if (angle === 0) {
        if (width - moveX > 0) {
          x += moveX;
          width -= moveX;
        }
        if (height - moveY > 0) {
          y += moveY;
          height -= moveY;
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = mtrlCenter.x;
        let centerY = mtrlCenter.y;

        if (angle < 90) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist =
            0 - changeMoveDistDirect(moveHorizontalDist, limitRatio ? 0 - moveVerticalDist : moveHorizontalX);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY - centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 180) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalX
          );
          const radian = parseRadian(angle - 90);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY + centerMoveVerticalDist * Math.sin(radian);

          const centerMoveDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 270) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalY
          );
          const radian = parseRadian(angle - 180);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY + centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 360) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalY
          );
          const radian = parseRadian(angle - 270);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY - centerMoveVerticalDist * Math.sin(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.cos(radian);
        }
        if (height + moveVerticalDist > 0) {
          height = height + moveVerticalDist;
        }
        if (width + moveHorizontalDist > 0) {
          width = width + moveHorizontalDist;
        }
        x = centerX - width / 2;
        y = centerY - height / 2;
      }
      break;
    }
    case 'resize-top-right': {
      if (angle === 0) {
        if (width + moveX > 0) {
          width += moveX;
        }
        if (height - moveY > 0) {
          y += moveY;
          height -= moveY;
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = mtrlCenter.x;
        let centerY = mtrlCenter.y;
        if (angle < 90) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalY
          );
          const radian = parseRadian(angle);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY - centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 180) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalY
          );
          const radian = parseRadian(angle - 90);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY + centerMoveVerticalDist * Math.sin(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.cos(radian);
        } else if (angle < 270) {
          const radian = parseRadian(angle - 180);
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : 0 - moveHorizontalX
          );
          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY + centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 360) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalX
          );
          const radian = parseRadian(angle - 270);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY - centerMoveVerticalDist * Math.sin(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.cos(radian);
        }
        if (height + moveVerticalDist > 0) {
          height = height + moveVerticalDist;
        }
        if (width + moveHorizontalDist > 0) {
          width = width + moveHorizontalDist;
        }
        x = centerX - width / 2;
        y = centerY - height / 2;
      }
      break;
    }
    case 'resize-bottom-left': {
      if (angle === 0) {
        if (mtrl.height + moveY > 0) {
          height += moveY;
        }
        if (mtrl.width - moveX > 0) {
          x += moveX;
          width -= moveX;
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = mtrlCenter.x;
        let centerY = mtrlCenter.y;
        if (angle < 90) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist =
            0 - changeMoveDistDirect(moveHorizontalDist, limitRatio ? 0 - moveVerticalDist : moveHorizontalX);
          const radian = parseRadian(angle);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY + centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 180) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalX
          );
          const radian = parseRadian(angle - 90);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY - centerMoveVerticalDist * Math.sin(radian);

          const centerMoveDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 270) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalY
          );
          const radian = parseRadian(angle - 180);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY - centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 360) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalY
          );
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.cos(radian);
        }
        if (height + moveVerticalDist > 0) {
          height = height + moveVerticalDist;
        }
        if (width + moveHorizontalDist > 0) {
          width = width + moveHorizontalDist;
        }
        x = centerX - width / 2;
        y = centerY - height / 2;
      }
      break;
    }
    case 'resize-bottom-right': {
      if (angle === 0) {
        if (mtrl.height + moveY > 0) {
          height += moveY;
        }
        if (mtrl.width + moveX > 0) {
          width += moveX;
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = mtrlCenter.x;
        let centerY = mtrlCenter.y;
        if (angle < 90) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalY
          );
          const radian = parseRadian(angle);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY + centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 180) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveY);
          const radian = parseRadian(angle - 90);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY - centerMoveVerticalDist * Math.sin(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.cos(radian);
        } else if (angle < 270) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : 0 - moveHorizontalY
          );
          const radian = parseRadian(angle - 180);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY - centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 360) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(
            moveHorizontalDist,
            limitRatio ? moveVerticalDist : moveHorizontalX
          );
          const radian = parseRadian(angle - 270);

          const centerMoveDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.cos(radian);
        }
        if (height + moveVerticalDist > 0) {
          height = height + moveVerticalDist;
        }
        if (width + moveHorizontalDist > 0) {
          width = width + moveHorizontalDist;
        }

        x = centerX - width / 2;
        y = centerY - height / 2;
      }
      break;
    }
    default: {
      break;
    }
  }

  return {
    x: calculator.toGridNum(x),
    y: calculator.toGridNum(y),
    width: calculator.toGridNum(width),
    height: calculator.toGridNum(height),
    angle: calculator.toGridNum(mtrl.angle || 0),
  };
}

export function rotateMaterial(
  mtrl: MaterialSize,
  opts: {
    center: Point;
    start: Point;
    end: Point;
    resizeType: ResizeType;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    sharer: StoreSharer;
    calculator: ViewCalculator;
  }
): MaterialSize {
  const { x, y, width, height, angle = 0 } = mtrl;
  const { center, start, end, viewScaleInfo, calculator } = opts;
  const mtrlCenter = calcViewPoint(center, {
    viewScaleInfo,
  });
  const startAngle = limitAngle(angle);
  const changedRadian = calcRadian(mtrlCenter, start, end);
  const endAngle = limitAngle(startAngle + parseRadianToAngle(changedRadian));

  return {
    x: calculator.toGridNum(x),
    y: calculator.toGridNum(y),
    width: calculator.toGridNum(width),
    height: calculator.toGridNum(height),
    angle: calculator.toGridNum(endAngle),
  };
}

export function getSelectedListArea(
  data: Data,
  opts: {
    start: Point;
    end: Point;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    calculator: ViewCalculator;
  }
): { indexes: number[]; ids: string[]; materials: StrictMaterial<MaterialType>[] } {
  const indexes: number[] = [];
  const ids: string[] = [];
  const materials: StrictMaterial<MaterialType>[] = [];
  const { viewScaleInfo, start, end } = opts;

  if (!(Array.isArray(data.materials) && start && end)) {
    return { indexes, ids, materials };
  }
  const startX = Math.min(start.x, end.x);
  const endX = Math.max(start.x, end.x);
  const startY = Math.min(start.y, end.y);
  const endY = Math.max(start.y, end.y);

  for (let idx = 0; idx < data.materials.length; idx++) {
    const mtrl = data.materials[idx];
    if (mtrl?.operations?.locked === true) {
      continue;
    }
    const mtrlSize = calcViewMaterialSize(mtrl, { viewScaleInfo });

    const center = calcMaterialCenter(mtrlSize);
    if (center.x >= startX && center.x <= endX && center.y >= startY && center.y <= endY) {
      indexes.push(idx);
      ids.push(mtrl.id);
      materials.push(mtrl);
      if (mtrlSize.angle && (mtrlSize.angle > 0 || mtrlSize.angle < 0)) {
        const ves = rotateMaterialVertexes(mtrlSize);
        if (ves.length === 4) {
          const xList = [ves[0].x, ves[1].x, ves[2].x, ves[3].x];
          const yList = [ves[0].y, ves[1].y, ves[2].y, ves[3].y];
          mtrlSize.x = Math.min(...xList);
          mtrlSize.y = Math.min(...yList);
          mtrlSize.width = Math.abs(Math.max(...xList) - Math.min(...xList));
          mtrlSize.height = Math.abs(Math.max(...yList) - Math.min(...yList));
        }
      }
    }
  }

  return { indexes, ids, materials };
}

export function calcSelectedMaterialsArea(
  materials: StrictMaterial<MaterialType>[],
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    calculator: ViewCalculator;
  }
): AreaSize | null {
  if (!Array.isArray(materials)) {
    return null;
  }
  const area: AreaSize = { x: 0, y: 0, width: 0, height: 0 };
  const { viewScaleInfo } = opts;
  let prevMtrlSize: MaterialSize | null = null;

  for (let i = 0; i < materials.length; i++) {
    const mtrl = materials[i];
    if (mtrl?.operations?.invisible) {
      continue;
    }
    const mtrlSize = calcViewMaterialSize(mtrl, { viewScaleInfo });

    if (mtrlSize.angle && (mtrlSize.angle > 0 || mtrlSize.angle < 0)) {
      const ves = rotateMaterialVertexes(mtrlSize);
      if (ves.length === 4) {
        const xList = [ves[0].x, ves[1].x, ves[2].x, ves[3].x];
        const yList = [ves[0].y, ves[1].y, ves[2].y, ves[3].y];
        mtrlSize.x = Math.min(...xList);
        mtrlSize.y = Math.min(...yList);
        mtrlSize.width = Math.abs(Math.max(...xList) - Math.min(...xList));
        mtrlSize.height = Math.abs(Math.max(...yList) - Math.min(...yList));
      }
    }
    if (prevMtrlSize) {
      const areaStartX = Math.min(mtrlSize.x, area.x);
      const areaStartY = Math.min(mtrlSize.y, area.y);

      const areaEndX = Math.max(mtrlSize.x + mtrlSize.width, area.x + area.width);
      const areaEndY = Math.max(mtrlSize.y + mtrlSize.height, area.y + area.height);

      area.x = areaStartX;
      area.y = areaStartY;
      area.width = Math.abs(areaEndX - areaStartX);
      area.height = Math.abs(areaEndY - areaStartY);
    } else {
      area.x = mtrlSize.x;
      area.y = mtrlSize.y;
      area.width = mtrlSize.width;
      area.height = mtrlSize.height;
    }
    prevMtrlSize = mtrlSize;
  }
  return area;
}

export function isMaterialInGroup(mtrl: StrictMaterial<MaterialType>, group: StrictMaterial<'group'>): boolean {
  if (group?.type === 'group' && Array.isArray(group?.children)) {
    for (let i = 0; i < group.children.length; i++) {
      const child = group.children[i];
      if (mtrl.id === child.id) {
        return true;
      }
    }
  }
  return false;
}
