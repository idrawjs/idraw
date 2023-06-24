import { calcElementCenter, rotateElementVertexes, calcElementVertexesInGroup, calcElementQueueVertexesQueueInGroup, calcViewPointSize } from '@idraw/util';
import type { ViewRectVertexes, ElementSizeController } from '@idraw/types';
import type {
  Data,
  Element,
  ViewContext2D,
  Point,
  PointSize,
  PointTarget,
  PointTargetType,
  ViewScaleInfo,
  ViewCalculator,
  ElementType,
  ElementSize,
  ResizeType,
  AreaSize,
  ViewSizeInfo
} from './types';

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
  const { ctx, viewScaleInfo, viewSizeInfo, vertexes } = opts;
  const v0 = calcViewPointSize(vertexes[0], { viewScaleInfo, viewSizeInfo });
  const v1 = calcViewPointSize(vertexes[1], { viewScaleInfo, viewSizeInfo });
  const v2 = calcViewPointSize(vertexes[2], { viewScaleInfo, viewSizeInfo });
  const v3 = calcViewPointSize(vertexes[3], { viewScaleInfo, viewSizeInfo });
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

  // in-group-element
  if (groupQueue && Array.isArray(groupQueue) && groupQueue.length > 0) {
    // return target;
    const lastGroup = groupQueue[groupQueue.length - 1];
    if (lastGroup?.detail?.children && Array.isArray(lastGroup?.detail?.children)) {
      for (let i = lastGroup.detail.children.length - 1; i >= 0; i--) {
        const child = lastGroup.detail.children[i];
        const vertexes = calcElementVertexesInGroup(child, { groupQueue });
        if (vertexes && isPointInViewActiveVertexes(p, { ctx, vertexes, viewScaleInfo, viewSizeInfo })) {
          target.type = 'in-group-element';
          target.groupQueue = groupQueue;
          target.elements = [child];
          return target;
        }
      }
    }
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

  // resize
  if (selectedElementController) {
    const { left, right, top, bottom } = selectedElementController;
    const ctrls = [left, right, top, bottom];
    for (let i = 0; i < ctrls.length; i++) {
      const ctrl = ctrls[i];
      if (isPointInViewActiveVertexes(p, { ctx, vertexes: ctrl.vertexes, viewSizeInfo, viewScaleInfo })) {
        target.type = `resize-${ctrl.type}` as PointTargetType;
        break;
      }
    }
    if (target.type !== null) {
      return target;
    }
  }

  // over-element
  if (data) {
    const { index, element } = calculator.getPointElement(p as Point, { data, viewScaleInfo, viewSizeInfo });
    if (index >= 0 && element) {
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
    start: Point;
    end: Point;
    resizeType: ResizeType;
    scale: number;
  }
): ElementSize {
  let { x, y, w, h, angle = 0 } = elem;
  if (angle < 0) {
    angle = Math.max(0, 360 + angle);
  }

  angle = angle > 0 ? angle : Math.max(0, angle + 360);
  const { start, end, resizeType, scale } = opts;

  let moveX = (end.x - start.x) / scale;
  let moveY = (end.y - start.y) / scale;

  if (elem.operation?.limitRatio === true) {
    const maxDist = Math.max(Math.abs(moveX), Math.abs(moveY));
    moveX = (moveX >= 0 ? 1 : -1) * maxDist;
    moveY = (((moveY >= 0 ? 1 : -1) * maxDist) / elem.w) * elem.h;
  }

  switch (resizeType) {
    case 'resize-top': {
      if (elem.angle === 0) {
        if (h - moveY > 0) {
          y += moveY;
          h -= moveY;
          if (elem.operation?.limitRatio === true) {
            x += ((moveY / elem.h) * elem.w) / 2;
            w -= (moveY / elem.h) * elem.w;
          }
        }
      } else if (elem.angle !== undefined && (elem.angle > 0 || elem.angle < 0)) {
        const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
        let moveDist = calcMoveDist(moveX, moveY);
        let centerX = x + elem.w / 2;
        let centerY = y + elem.h / 2;
        if (angle < 90) {
          moveDist = 0 - changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 180) {
          moveDist = changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 90);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
        } else if (angle < 270) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle - 180);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.sin(radian);
          centerY = centerY + centerMoveDist * Math.cos(radian);
        } else if (angle < 360) {
          moveDist = 0 - changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.cos(radian);
          centerY = centerY - centerMoveDist * Math.sin(radian);
        }
        if (h + moveDist > 0) {
          if (elem.operation?.limitRatio === true) {
            w = w + (moveDist / elem.h) * elem.w;
          }
          h = h + moveDist;
          x = centerX - w / 2;
          y = centerY - h / 2;
        }
      } else {
        if (h - moveY > 0) {
          y += moveY;
          h -= moveY;
          if (elem.operation?.limitRatio === true) {
            x -= moveX / 2;
            w += moveX;
          }
        }
      }
      break;
    }
    case 'resize-bottom': {
      if (elem.angle === 0) {
        if (elem.h + moveY > 0) {
          h += moveY;
          if (elem.operation?.limitRatio === true) {
            x -= ((moveY / elem.h) * elem.w) / 2;
            w += (moveY / elem.h) * elem.w;
          }
        }
      } else if (elem.angle !== undefined && (elem.angle > 0 || elem.angle < 0)) {
        const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
        let moveDist = calcMoveDist(moveX, moveY);
        let centerX = x + elem.w / 2;
        let centerY = y + elem.h / 2;
        if (angle < 90) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.sin(radian);
          centerY = centerY + centerMoveDist * Math.cos(radian);
        } else if (angle < 180) {
          moveDist = 0 - changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 90);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.cos(radian);
          centerY = centerY - centerMoveDist * Math.sin(radian);
        } else if (angle < 270) {
          moveDist = changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 180);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 360) {
          moveDist = changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
        }
        if (h + moveDist > 0) {
          if (elem.operation?.limitRatio === true) {
            w = w + (moveDist / elem.h) * elem.w;
          }
          h = h + moveDist;
          x = centerX - w / 2;
          y = centerY - h / 2;
        }
      } else {
        if (elem.h + moveY > 0) {
          h += moveY;
          if (elem.operation?.limitRatio === true) {
            x -= ((moveY / elem.h) * elem.w) / 2;
            w += (moveY / elem.h) * elem.w;
          }
        }
      }
      break;
    }
    case 'resize-left': {
      if (angle === 0 || !angle) {
        if (elem.w - moveX > 0) {
          x += moveX;
          w -= moveX;
          if (elem.operation?.limitRatio === true) {
            h -= (moveX / elem.w) * elem.h;
            y += ((moveX / elem.w) * elem.h) / 2;
          }
        }
      } else if (elem.angle !== undefined && (elem.angle > 0 || elem.angle < 0)) {
        const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
        let moveDist = calcMoveDist(moveX, moveY);
        let centerX = x + elem.w / 2;
        let centerY = y + elem.h / 2;
        if (angle < 90) {
          moveDist = 0 - changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.cos(radian);
          centerY = centerY - centerMoveDist * Math.sin(radian);
        } else if (angle < 180) {
          moveDist = changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 90);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 270) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle - 180);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
        } else if (angle < 360) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.sin(radian);
          centerY = centerY + centerMoveDist * Math.cos(radian);
        }
        if (w + moveDist > 0) {
          if (elem.operation?.limitRatio === true) {
            h = h + (moveDist / elem.w) * elem.h;
          }
          w = w + moveDist;
          x = centerX - w / 2;
          y = centerY - h / 2;
        }
      } else {
        if (elem.w - moveX > 0) {
          x += moveX;
          w -= moveX;
          if (elem.operation?.limitRatio === true) {
            h -= (moveX / elem.w) * elem.h;
            y += ((moveX / elem.w) * elem.h) / 2;
          }
        }
      }
      break;
    }
    case 'resize-right': {
      if (angle === 0 || !angle) {
        if (elem.w + moveX > 0) {
          w += moveX;
          if (elem.operation?.limitRatio === true) {
            y -= (moveX * elem.h) / elem.w / 2;
            h += (moveX * elem.h) / elem.w;
          }
        }
      } else if (elem.angle !== undefined && (elem.angle > 0 || elem.angle < 0)) {
        const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
        let moveDist = calcMoveDist(moveX, moveY);
        let centerX = x + elem.w / 2;
        let centerY = y + elem.h / 2;
        if (angle < 90) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
        } else if (angle < 180) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle - 90);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.sin(radian);
          centerY = centerY + centerMoveDist * Math.cos(radian);
        } else if (angle < 270) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle - 180);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
          moveDist = 0 - moveDist;
        } else if (angle < 360) {
          moveDist = changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        }
        if (w + moveDist > 0) {
          if (elem.operation?.limitRatio === true) {
            h = h + (moveDist / elem.w) * elem.h;
          }
          w = w + moveDist;
          x = centerX - w / 2;
          y = centerY - h / 2;
        }
      } else {
        if (elem.w + moveX > 0) {
          w += moveX;
          if (elem.operation?.limitRatio === true) {
            h += (moveX * elem.h) / elem.w;
            y -= (moveX * elem.h) / elem.w / 2;
          }
        }
      }
      break;
    }
    default: {
      break;
    }
  }

  return { x, y, w, h, angle: elem.angle };
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
  const { calculator, viewScaleInfo, viewSizeInfo, start, end } = opts;

  if (!(Array.isArray(data.elements) && start && end)) {
    return { indexes, uuids, elements };
  }
  const startX = Math.min(start.x, end.x);
  const endX = Math.max(start.x, end.x);
  const startY = Math.min(start.y, end.y);
  const endY = Math.max(start.y, end.y);

  data.elements.forEach((elem, idx) => {
    const elemSize = calculator.elementSize(elem, viewScaleInfo, viewSizeInfo);

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
  });
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
  const { calculator, viewScaleInfo, viewSizeInfo } = opts;
  let prevElemSize: ElementSize | null = null;

  elements.forEach((elem) => {
    const elemSize = calculator.elementSize(elem, viewScaleInfo, viewSizeInfo);

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
  });
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
