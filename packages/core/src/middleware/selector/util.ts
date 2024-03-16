import {
  calcElementCenter,
  rotateElementVertexes,
  calcElementVertexesInGroup,
  calcElementQueueVertexesQueueInGroup,
  calcViewPointSize,
  calcViewElementSize,
  rotatePointInGroup,
  rotatePoint,
  parseAngleToRadian,
  parseRadianToAngle,
  limitAngle,
  calcRadian
} from '@idraw/util';
import type { ViewRectVertexes, ElementSizeController, StoreSharer, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';
import type {
  Data,
  Element,
  ViewContext2D,
  Point,
  PointSize,
  PointTarget,
  PointTargetType,
  ViewCalculator,
  ElementType,
  ElementSize,
  ResizeType,
  AreaSize
} from './types';
// import { keyDebugElemCenter, keyDebugEnd0, keyDebugEndHorizontal, keyDebugEndVertical, keyDebugStartHorizontal, keyDebugStartVertical } from './config';

function parseRadian(angle: number) {
  return (angle * Math.PI) / 180;
}

function calcMoveDist(moveX: number, moveY: number) {
  return Math.sqrt(moveX * moveX + moveY * moveY);
}

function changeMoveDistDirect(moveDist: number, moveDirect: number) {
  return moveDirect > 0 ? Math.abs(moveDist) : 0 - Math.abs(moveDist);
}

export function isPointInViewActiveVertexes(
  p: PointSize,
  opts: { ctx: ViewContext2D; vertexes: ViewRectVertexes; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): boolean {
  const { ctx, viewScaleInfo, vertexes } = opts;
  const v0 = calcViewPointSize(vertexes[0], { viewScaleInfo });
  const v1 = calcViewPointSize(vertexes[1], { viewScaleInfo });
  const v2 = calcViewPointSize(vertexes[2], { viewScaleInfo });
  const v3 = calcViewPointSize(vertexes[3], { viewScaleInfo });
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

export function isPointInViewActiveGroup(
  p: PointSize,
  opts: { ctx: ViewContext2D; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo; groupQueue: Element<'group'>[] | null }
): boolean {
  const { ctx, viewScaleInfo, viewSizeInfo, groupQueue } = opts;
  if (!groupQueue || !(groupQueue?.length > 0)) {
    return false;
  }
  const vesQueue = calcElementQueueVertexesQueueInGroup(groupQueue);
  const vertexes = vesQueue[vesQueue.length - 1];
  if (!vertexes) {
    return false;
  }
  return isPointInViewActiveVertexes(p, { ctx, vertexes, viewScaleInfo, viewSizeInfo });
}

export function getPointTarget(
  p: PointSize,
  opts: {
    ctx: ViewContext2D;
    data?: Data | null;
    selectedElements?: Element<ElementType>[];
    areaSize?: AreaSize | null;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    calculator: ViewCalculator;
    groupQueue: Element<'group'>[] | null;
    selectedElementController: ElementSizeController | null;
  }
): PointTarget {
  const target: PointTarget = {
    type: null,
    elements: [],
    elementVertexesList: [],
    groupQueue: [],
    groupQueueVertexesList: []
  };
  const { ctx, data, calculator, selectedElements, viewScaleInfo, viewSizeInfo, areaSize, groupQueue, selectedElementController } = opts;

  // resize
  if (selectedElementController) {
    const { left, right, top, bottom, topLeft, topRight, bottomLeft, bottomRight, rotate } = selectedElementController;
    const ctrls = [left, right, top, bottom, topLeft, topRight, bottomLeft, bottomRight, rotate];
    for (let i = 0; i < ctrls.length; i++) {
      const ctrl = ctrls[i];
      if (isPointInViewActiveVertexes(p, { ctx, vertexes: ctrl.vertexes, viewSizeInfo, viewScaleInfo })) {
        target.type = `resize-${ctrl.type}` as PointTargetType;
        if (selectedElements && selectedElements?.length > 0) {
          target.groupQueue = groupQueue || [];
          target.elements = [selectedElements[0]];
        }
        break;
      }
    }
  }

  // in group
  if (groupQueue && Array.isArray(groupQueue) && groupQueue.length > 0) {
    // return target;
    const lastGroup = groupQueue[groupQueue.length - 1];
    if (lastGroup?.detail?.children && Array.isArray(lastGroup?.detail?.children)) {
      for (let i = lastGroup.detail.children.length - 1; i >= 0; i--) {
        const child = lastGroup.detail.children[i];
        // if (child?.operations?.invisible === true) {
        //   continue;
        // }
        const vertexes = calcElementVertexesInGroup(child, { groupQueue });
        if (vertexes && isPointInViewActiveVertexes(p, { ctx, vertexes, viewScaleInfo, viewSizeInfo })) {
          if (!target.type) {
            target.type = 'over-element';
          }
          target.groupQueue = groupQueue;
          target.elements = [child];
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
  if (areaSize && Array.isArray(selectedElements) && selectedElements?.length > 1) {
    const { x, y, w, h } = areaSize;
    if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) {
      target.type = 'list-area';
      target.elements = selectedElements;
      return target;
    }
  }

  // over-element
  if (data) {
    const { index, element } = calculator.getPointElement(p as Point, { data, viewScaleInfo, viewSizeInfo });
    if (index >= 0 && element && element?.operations?.invisible !== true) {
      target.elements = [element];
      target.type = 'over-element';
      return target;
    }
  }

  return target;
}

export function resizeElement(
  elem: Element<ElementType>,
  opts: {
    start: PointSize;
    end: PointSize;
    resizeType: ResizeType;
    scale: number;
    sharer: StoreSharer; // TODO
  }
): ElementSize {
  let { x, y, w, h, angle = 0 } = elem;
  const elemCenter = calcElementCenter({ x, y, w, h, angle });
  // const centerX = elemCenter.x;
  // const centerY = elemCenter.y;

  angle = limitAngle(angle);
  const radian = parseAngleToRadian(angle);
  const limitRatio = !!elem?.operations?.limitRatio;
  const { start, end, resizeType, scale } = opts;

  let start0: PointSize = { ...start };
  let end0: PointSize = { ...end };
  let startHorizontal0 = { x: start0.x, y: elemCenter.y };
  let endHorizontal0 = { x: end0.x, y: elemCenter.y };
  let startHorizontal = { ...startHorizontal0 };
  let endHorizontal = { ...endHorizontal0 };
  let startVertical0 = { x: elemCenter.x, y: start0.y };
  let endVertical0 = { x: elemCenter.x, y: end0.y };
  let startVertical = { ...startVertical0 };
  let endVertical = { ...endVertical0 };

  let moveHorizontalX = (endHorizontal.x - startHorizontal.x) / scale;
  let moveHorizontalY = (endHorizontal.y - startHorizontal.y) / scale;
  let moveHorizontalDist = calcMoveDist(moveHorizontalX, moveHorizontalY);
  let centerMoveHorizontalDist = 0;

  let moveVerticalX = (endVertical.x - startVertical.x) / scale;
  let moveVerticalY = (endVertical.y - startVertical.y) / scale;
  let moveVerticalDist = calcMoveDist(moveVerticalX, moveVerticalY);
  let centerMoveVerticalDist = 0;

  if (angle > 0 || angle < 0) {
    start0 = rotatePoint(elemCenter, start, 0 - radian);
    end0 = rotatePoint(elemCenter, end, 0 - radian);

    startHorizontal0 = { x: start0.x, y: elemCenter.y };
    endHorizontal0 = { x: end0.x, y: elemCenter.y };
    startHorizontal = rotatePoint(elemCenter, startHorizontal0, radian);
    endHorizontal = rotatePoint(elemCenter, endHorizontal0, radian);

    startVertical0 = { x: elemCenter.x, y: start0.y };
    endVertical0 = { x: elemCenter.x, y: end0.y };
    startVertical = rotatePoint(elemCenter, startVertical0, radian);
    endVertical = rotatePoint(elemCenter, endVertical0, radian);

    moveHorizontalX = (endHorizontal.x - startHorizontal.x) / scale;
    moveHorizontalY = (endHorizontal.y - startHorizontal.y) / scale;
    moveHorizontalDist = calcMoveDist(moveHorizontalX, moveHorizontalY);
    moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, moveHorizontalY);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    centerMoveHorizontalDist = moveHorizontalDist / 2;

    moveVerticalX = (endVertical.x - startVertical.x) / scale;
    moveVerticalY = (endVertical.y - startVertical.y) / scale;
    moveVerticalDist = calcMoveDist(moveVerticalX, moveVerticalY);
    moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    centerMoveVerticalDist = moveVerticalDist / 2;
  }

  let moveX = (end.x - start.x) / scale;
  let moveY = (end.y - start.y) / scale;

  if (limitRatio === true) {
    // TODO
    if (['resize-top', 'resize-bottom', 'resize-left', 'resize-right'].includes(resizeType)) {
      const maxDist = Math.max(Math.abs(moveX), Math.abs(moveY));
      moveX = (moveX >= 0 ? 1 : -1) * maxDist;
      moveY = (((moveY >= 0 ? 1 : -1) * maxDist) / elem.w) * elem.h;

      const maxVerticalDist = Math.max(Math.abs(moveVerticalX), Math.abs(moveVerticalY));
      moveVerticalX = (moveVerticalX >= 0 ? 1 : -1) * maxVerticalDist;
      moveVerticalY = (((moveVerticalY >= 0 ? 1 : -1) * maxVerticalDist) / elem.w) * elem.h;

      const maxHorizontalDist = Math.max(Math.abs(moveHorizontalX), Math.abs(moveHorizontalY));
      moveHorizontalX = (moveHorizontalX >= 0 ? 1 : -1) * maxHorizontalDist;
      moveHorizontalY = (((moveHorizontalY >= 0 ? 1 : -1) * maxHorizontalDist) / elem.w) * elem.h;
    } else if (['resize-top-left', 'resize-top-right', 'resize-bottom-left', 'resize-bottom-right'].includes(resizeType)) {
      {
        // const maxDist = Math.max(Math.abs(moveX), Math.abs(moveY));
        const maxDist = Math.abs(moveX);
        moveX = (moveX >= 0 ? 1 : -1) * maxDist;
        const moveYLeng = (maxDist / elem.w) * elem.h;
        if (resizeType === 'resize-top-left' || resizeType === 'resize-bottom-right') {
          moveY = moveX > 0 ? moveYLeng : -moveYLeng;
        } else if (resizeType === 'resize-top-right' || resizeType === 'resize-bottom-left') {
          moveY = moveX > 0 ? -moveYLeng : moveYLeng;
        }
      }

      {
        moveHorizontalDist = Math.abs(moveHorizontalDist);
        moveVerticalDist = (moveHorizontalDist / elem.w) * elem.h;

        // // const maxDist = Math.max(Math.abs(moveHorizontalDist), Math.abs(moveVerticalDist));
        // const maxDist = Math.abs(moveHorizontalDist);
        // moveHorizontalDist = (moveHorizontalX >= 0 ? 1 : -1) * maxDist;
        // const moveVerticalDistLeng = (maxDist / elem.w) * elem.h;
        // if (resizeType === 'resize-top-left') {
        //   moveVerticalDist = moveHorizontalDist > 0 ? moveVerticalDistLeng : -moveVerticalDistLeng;
        // }

        // console.log('moveHorizontalDist, moveHorizontalDist ====== ', moveHorizontalDist, moveHorizontalDist);
        // if (resizeType === 'resize-top-left' || resizeType === 'resize-bottom-right') {
        //   moveVerticalDist = moveHorizontalDist > 0 ? moveVerticalDistLeng : -moveVerticalDistLeng;
        // } else if (resizeType === 'resize-top-right' || resizeType === 'resize-bottom-left') {
        //   moveVerticalDist = moveHorizontalDist > 0 ? -moveVerticalDistLeng : moveVerticalDistLeng;
        // }
      }

      // const maxVerticalDist = Math.max(Math.abs(moveVerticalX), Math.abs(moveVerticalY));
      // moveVerticalX = (moveVerticalX >= 0 ? 1 : -1) * maxVerticalDist;
      // const moveVerticalYDist = (maxVerticalDist / elem.w) * elem.h;
      // if (resizeType === 'resize-top-left' || resizeType === 'resize-bottom-right') {
      //   moveVerticalY = moveVerticalX > 0 ? moveVerticalYDist : -moveVerticalYDist;
      // } else if (resizeType === 'resize-top-right' || resizeType === 'resize-bottom-left') {
      //   moveVerticalY = moveVerticalX > 0 ? -moveVerticalYDist : moveVerticalYDist;
      // }

      // const maxHorizontalDist = Math.max(Math.abs(moveHorizontalX), Math.abs(moveHorizontalY));
      // moveHorizontalX = (moveHorizontalX >= 0 ? 1 : -1) * maxHorizontalDist;
      // const moveHorizontalYDist = (maxHorizontalDist / elem.w) * elem.h;
      // if (resizeType === 'resize-top-left' || resizeType === 'resize-bottom-right') {
      //   moveHorizontalY = moveHorizontalX > 0 ? moveHorizontalYDist : -moveHorizontalYDist;
      // } else if (resizeType === 'resize-top-right' || resizeType === 'resize-bottom-left') {
      //   moveHorizontalY = moveHorizontalX > 0 ? -moveHorizontalYDist : moveHorizontalYDist;
      // }

      // const maxVerticalDist = Math.abs(moveVerticalX);
      // moveVerticalX = (moveVerticalX >= 0 ? 1 : -1) * maxVerticalDist;
      // moveVerticalY = (((moveVerticalY >= 0 ? 1 : -1) * maxVerticalDist) / elem.w) * elem.h;

      // const maxHorizontalDist = Math.abs(moveHorizontalX);
      // moveHorizontalX = (moveHorizontalX >= 0 ? 1 : -1) * maxHorizontalDist;
      // moveHorizontalY = (((moveHorizontalY >= 0 ? 1 : -1) * maxHorizontalDist) / elem.w) * elem.h;
    }
  }

  switch (resizeType) {
    case 'resize-top': {
      if (angle === 0) {
        if (h - moveY > 0) {
          y += moveY;
          h -= moveY;
          if (elem.operations?.limitRatio === true) {
            x += ((moveY / elem.h) * elem.w) / 2;
            w -= (moveY / elem.h) * elem.w;
          }
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = elemCenter.x;
        let centerY = elemCenter.y;
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
        if (h + moveVerticalDist > 0) {
          if (elem.operations?.limitRatio === true) {
            w = w + (moveVerticalDist / elem.h) * elem.w;
          }
          h = h + moveVerticalDist;
          x = centerX - w / 2;
          y = centerY - h / 2;
        }
      }
      break;
    }
    case 'resize-bottom': {
      if (angle === 0) {
        if (elem.h + moveY > 0) {
          h += moveY;
          if (elem.operations?.limitRatio === true) {
            x -= ((moveY / elem.h) * elem.w) / 2;
            w += (moveY / elem.h) * elem.w;
          }
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = elemCenter.x;
        let centerY = elemCenter.y;
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
        if (h + moveVerticalDist > 0) {
          if (elem.operations?.limitRatio === true) {
            w = w + (moveVerticalDist / elem.h) * elem.w;
          }
          h = h + moveVerticalDist;
          x = centerX - w / 2;
          y = centerY - h / 2;
        }
      }
      break;
    }
    case 'resize-left': {
      if (angle === 0) {
        if (elem.w - moveX > 0) {
          x += moveX;
          w -= moveX;
          if (elem.operations?.limitRatio === true) {
            h -= (moveX / elem.w) * elem.h;
            y += ((moveX / elem.w) * elem.h) / 2;
          }
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = elemCenter.x;
        let centerY = elemCenter.y;
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
        if (w + moveHorizontalDist > 0) {
          if (elem.operations?.limitRatio === true) {
            h = h + (moveHorizontalDist / elem.w) * elem.h;
          }
          w = w + moveHorizontalDist;
          x = centerX - w / 2;
          y = centerY - h / 2;
        }
      }
      break;
    }
    case 'resize-right': {
      if (angle === 0) {
        if (elem.w + moveX > 0) {
          w += moveX;
          if (elem.operations?.limitRatio === true) {
            y -= (moveX * elem.h) / elem.w / 2;
            h += (moveX * elem.h) / elem.w;
          }
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = elemCenter.x;
        let centerY = elemCenter.y;
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
        if (w + moveHorizontalDist > 0) {
          if (elem.operations?.limitRatio === true) {
            h = h + (moveHorizontalDist / elem.w) * elem.h;
          }
          w = w + moveHorizontalDist;
          x = centerX - w / 2;
          y = centerY - h / 2;
        }
      }
      break;
    }
    case 'resize-top-left': {
      if (angle === 0) {
        if (w - moveX > 0) {
          x += moveX;
          w -= moveX;
        }
        if (h - moveY > 0) {
          y += moveY;
          h -= moveY;
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = elemCenter.x;
        let centerY = elemCenter.y;

        if (angle < 90) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist = 0 - changeMoveDistDirect(moveHorizontalDist, limitRatio ? 0 - moveVerticalDist : moveHorizontalX);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY - centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 180) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalX);
          const radian = parseRadian(angle - 90);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY + centerMoveVerticalDist * Math.sin(radian);

          const centerMoveDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 270) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalY);
          const radian = parseRadian(angle - 180);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY + centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 360) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalY);
          const radian = parseRadian(angle - 270);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY - centerMoveVerticalDist * Math.sin(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.cos(radian);
        }
        if (h + moveVerticalDist > 0) {
          h = h + moveVerticalDist;
        }
        if (w + moveHorizontalDist > 0) {
          w = w + moveHorizontalDist;
        }
        x = centerX - w / 2;
        y = centerY - h / 2;
      }
      break;
    }
    case 'resize-top-right': {
      if (angle === 0) {
        if (w + moveX > 0) {
          w += moveX;
        }
        if (h - moveY > 0) {
          y += moveY;
          h -= moveY;
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = elemCenter.x;
        let centerY = elemCenter.y;
        if (angle < 90) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalY);
          const radian = parseRadian(angle);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY - centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 180) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalY);
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
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : 0 - moveHorizontalX);
          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY + centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 360) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalX);
          const radian = parseRadian(angle - 270);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY - centerMoveVerticalDist * Math.sin(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.cos(radian);
        }
        if (h + moveVerticalDist > 0) {
          h = h + moveVerticalDist;
        }
        if (w + moveHorizontalDist > 0) {
          w = w + moveHorizontalDist;
        }
        x = centerX - w / 2;
        y = centerY - h / 2;
      }
      break;
    }
    case 'resize-bottom-left': {
      if (angle === 0) {
        if (elem.h + moveY > 0) {
          h += moveY;
        }
        if (elem.w - moveX > 0) {
          x += moveX;
          w -= moveX;
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = elemCenter.x;
        let centerY = elemCenter.y;
        if (angle < 90) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist = 0 - changeMoveDistDirect(moveHorizontalDist, limitRatio ? 0 - moveVerticalDist : moveHorizontalX);
          const radian = parseRadian(angle);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY + centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 180) {
          moveVerticalDist = 0 - changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalX);
          const radian = parseRadian(angle - 90);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX - centerMoveVerticalDist * Math.cos(radian);
          centerY = centerY - centerMoveVerticalDist * Math.sin(radian);

          const centerMoveDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 270) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalY);
          const radian = parseRadian(angle - 180);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY - centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 360) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalY);
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY + centerMoveHorizontalDist * Math.cos(radian);
        }
        if (h + moveVerticalDist > 0) {
          h = h + moveVerticalDist;
        }
        if (w + moveHorizontalDist > 0) {
          w = w + moveHorizontalDist;
        }
        x = centerX - w / 2;
        y = centerY - h / 2;
      }
      break;
    }
    case 'resize-bottom-right': {
      if (angle === 0) {
        if (elem.h + moveY > 0) {
          h += moveY;
        }
        if (elem.w + moveX > 0) {
          w += moveX;
        }
      } else if (angle > 0 || angle < 0) {
        let centerX = elemCenter.x;
        let centerY = elemCenter.y;
        if (angle < 90) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalY);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalY);
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
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : 0 - moveHorizontalY);
          const radian = parseRadian(angle - 180);

          const centerMoveVerticalDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveVerticalDist * Math.sin(radian);
          centerY = centerY - centerMoveVerticalDist * Math.cos(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX - centerMoveHorizontalDist * Math.cos(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.sin(radian);
        } else if (angle < 360) {
          moveVerticalDist = changeMoveDistDirect(moveVerticalDist, moveVerticalX);
          moveHorizontalDist = changeMoveDistDirect(moveHorizontalDist, limitRatio ? moveVerticalDist : moveHorizontalX);
          const radian = parseRadian(angle - 270);

          const centerMoveDist = moveVerticalDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);

          const centerMoveHorizontalDist = moveHorizontalDist / 2;
          centerX = centerX + centerMoveHorizontalDist * Math.sin(radian);
          centerY = centerY - centerMoveHorizontalDist * Math.cos(radian);
        }
        if (h + moveVerticalDist > 0) {
          h = h + moveVerticalDist;
        }
        if (w + moveHorizontalDist > 0) {
          w = w + moveHorizontalDist;
        }

        x = centerX - w / 2;
        y = centerY - h / 2;
      }
      break;
    }
    default: {
      break;
    }
  }

  // // TODO mock data
  // const sharer = opts.sharer;
  // sharer.setSharedStorage(keyDebugElemCenter, elemCenter);
  // sharer.setSharedStorage(keyDebugStartVertical, startVertical);
  // sharer.setSharedStorage(keyDebugEndVertical, endVertical);
  // sharer.setSharedStorage(keyDebugStartHorizontal, startHorizontal);
  // sharer.setSharedStorage(keyDebugEndHorizontal, endHorizontal);
  // sharer.setSharedStorage(keyDebugStartHorizontal, startHorizontal);
  // sharer.setSharedStorage(keyDebugEnd0, end);

  return { x, y, w, h, angle: elem.angle };
}

export function rotateElement(
  elem: Element<ElementType>,
  opts: {
    center: PointSize;
    start: PointSize;
    end: PointSize;
    resizeType: ResizeType;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    sharer: StoreSharer; // TODO
  }
): ElementSize {
  const { x, y, w, h, angle = 0 } = elem;
  const { center, start, end, viewScaleInfo } = opts;
  const elemCenter = calcViewPointSize(center, {
    viewScaleInfo
  });
  const startAngle = limitAngle(angle);
  const changedRadian = calcRadian(elemCenter, start, end);
  const endAngle = startAngle + parseRadianToAngle(changedRadian);

  return {
    x,
    y,
    w,
    h,
    angle: endAngle
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
): { indexes: number[]; uuids: string[]; elements: Element<ElementType>[] } {
  const indexes: number[] = [];
  const uuids: string[] = [];
  const elements: Element<ElementType>[] = [];
  const { viewScaleInfo, viewSizeInfo, start, end } = opts;

  if (!(Array.isArray(data.elements) && start && end)) {
    return { indexes, uuids, elements };
  }
  const startX = Math.min(start.x, end.x);
  const endX = Math.max(start.x, end.x);
  const startY = Math.min(start.y, end.y);
  const endY = Math.max(start.y, end.y);

  for (let idx = 0; idx < data.elements.length; idx++) {
    const elem = data.elements[idx];
    if (elem?.operations?.lock === true) {
      continue;
    }
    const elemSize = calcViewElementSize(elem, { viewScaleInfo, viewSizeInfo });

    const center = calcElementCenter(elemSize);
    if (center.x >= startX && center.x <= endX && center.y >= startY && center.y <= endY) {
      indexes.push(idx);
      uuids.push(elem.uuid);
      elements.push(elem);
      if (elemSize.angle && (elemSize.angle > 0 || elemSize.angle < 0)) {
        const ves = rotateElementVertexes(elemSize);
        if (ves.length === 4) {
          const xList = [ves[0].x, ves[1].x, ves[2].x, ves[3].x];
          const yList = [ves[0].y, ves[1].y, ves[2].y, ves[3].y];
          elemSize.x = Math.min(...xList);
          elemSize.y = Math.min(...yList);
          elemSize.w = Math.abs(Math.max(...xList) - Math.min(...xList));
          elemSize.h = Math.abs(Math.max(...yList) - Math.min(...yList));
        }
      }
    }
  }

  return { indexes, uuids, elements };
}

export function calcSelectedElementsArea(
  elements: Element<ElementType>[],
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    calculator: ViewCalculator;
  }
): AreaSize | null {
  if (!Array.isArray(elements)) {
    return null;
  }
  const area: AreaSize = { x: 0, y: 0, w: 0, h: 0 };
  const { viewScaleInfo, viewSizeInfo } = opts;
  let prevElemSize: ElementSize | null = null;

  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i];
    if (elem?.operations?.invisible) {
      continue;
    }
    const elemSize = calcViewElementSize(elem, { viewScaleInfo, viewSizeInfo });

    if (elemSize.angle && (elemSize.angle > 0 || elemSize.angle < 0)) {
      const ves = rotateElementVertexes(elemSize);
      if (ves.length === 4) {
        const xList = [ves[0].x, ves[1].x, ves[2].x, ves[3].x];
        const yList = [ves[0].y, ves[1].y, ves[2].y, ves[3].y];
        elemSize.x = Math.min(...xList);
        elemSize.y = Math.min(...yList);
        elemSize.w = Math.abs(Math.max(...xList) - Math.min(...xList));
        elemSize.h = Math.abs(Math.max(...yList) - Math.min(...yList));
      }
    }
    if (prevElemSize) {
      const areaStartX = Math.min(elemSize.x, area.x);
      const areaStartY = Math.min(elemSize.y, area.y);

      const areaEndX = Math.max(elemSize.x + elemSize.w, area.x + area.w);
      const areaEndY = Math.max(elemSize.y + elemSize.h, area.y + area.h);

      area.x = areaStartX;
      area.y = areaStartY;
      area.w = Math.abs(areaEndX - areaStartX);
      area.h = Math.abs(areaEndY - areaStartY);
    } else {
      area.x = elemSize.x;
      area.y = elemSize.y;
      area.w = elemSize.w;
      area.h = elemSize.h;
    }
    prevElemSize = elemSize;
  }
  return area;
}

export function isElementInGroup(elem: Element<ElementType>, group: Element<'group'>): boolean {
  if (group?.type === 'group' && Array.isArray(group?.detail?.children)) {
    for (let i = 0; i < group.detail.children.length; i++) {
      const child = group.detail.children[i];
      if (elem.uuid === child.uuid) {
        return true;
      }
    }
  }
  return false;
}

export function calcMoveInGroup(start: PointSize, end: PointSize, groupQueue: Element<'group'>[]): { moveX: number; moveY: number } {
  let moveX = end.x - start.x;
  let moveY = end.y - start.y;
  const pointGroupQueue: Element<'group'>[] = [];
  groupQueue.forEach((group) => {
    const { x, y, w, h, angle = 0 } = group;
    pointGroupQueue.push({
      x,
      y,
      w,
      h,
      angle: 0 - angle
    } as Element<'group'>);
  });

  if (groupQueue?.length > 0) {
    const startInGroup = rotatePointInGroup(start, pointGroupQueue);
    const endInGroup = rotatePointInGroup(end, pointGroupQueue);
    moveX = endInGroup.x - startInGroup.x;
    moveY = endInGroup.y - startInGroup.y;
  }

  return {
    moveX,
    moveY
  };
}
