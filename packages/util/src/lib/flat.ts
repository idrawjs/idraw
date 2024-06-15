import type { Element, ElementSize, Elements, ViewRectVertexes } from '@idraw/types';
import { calcElementVertexesInGroup } from './vertex';
import { limitAngle, parseAngleToRadian, calcElementCenterFromVertexes, rotatePoint } from './rotate';

function flatElementSize(
  elemSize: ElementSize,
  opts: {
    groupQueue: Element<'group'>[];
  }
): ElementSize {
  const { groupQueue } = opts;
  let { x, y, w, h, angle = 0 } = elemSize;
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
      w,
      h,
      angle
    };
  }
  totalAngle += elemSize.angle || 0;
  totalAngle = limitAngle(totalAngle);

  const vertexes = calcElementVertexesInGroup(elemSize, { groupQueue }) as ViewRectVertexes;
  const center = calcElementCenterFromVertexes(vertexes);
  const start = rotatePoint(center, vertexes[0], parseAngleToRadian(0 - totalAngle));
  x = start.x;
  y = start.y;
  return {
    x,
    y,
    w,
    h,
    angle: totalAngle
  };
}

function isValidElement(elem: Element) {
  if (['rect', 'circle'].includes(elem.type)) {
    const detail = (elem as Element<'rect'>).detail;
    if (!detail.background && !detail.borderWidth) {
      return false;
    }
    if (detail.background === 'transparent' && !detail.borderWidth) {
      return false;
    }
  }
  if (['group'].includes(elem.type)) {
    const detail = (elem as Element<'group'>).detail || {};
    const { children } = detail;

    if (!(children.length > 0) && !detail.background && !detail.borderWidth) {
      return false;
    }
    if (!(children.length > 0) && detail.background === 'transparent' && !detail.borderWidth) {
      return false;
    }
  }
  if (elem.type === 'text') {
    if (!(elem as Element<'text'>).detail.text) {
      return false;
    }
  }

  if (elem.type === 'image') {
    if (!(elem as Element<'image'>).detail.src) {
      return false;
    }
  }

  if (elem.type === 'html') {
    if (!(elem as Element<'html'>).detail.html) {
      return false;
    }
  }

  if (elem.type === 'svg') {
    if (!(elem as Element<'svg'>).detail.svg) {
      return false;
    }
  }

  if (elem.type === 'path') {
    const detail = (elem as Element<'path'>).detail;
    if (!(detail?.commands?.length > 0)) {
      return false;
    }
  }

  return true;
}

export function flatElementList(list: Elements): Elements {
  const elemeList: Elements = [];
  const currentGroupQueue: Array<Element<'group'>> = [];

  const _resetElemSize = (elem: Element) => {
    if (!isValidElement(elem)) {
      return;
    }
    const newSize = flatElementSize(elem, { groupQueue: currentGroupQueue });
    const resizeElem = {
      ...elem,
      ...newSize
    };

    elemeList.push(resizeElem);
  };

  const _walk = (elem: Element) => {
    if (elem?.operations?.invisible === true) {
      return;
    }

    if (elem.type === 'group') {
      const { detail } = elem as Element<'group'>;
      const { children, ...restDetail } = detail;
      _resetElemSize({ ...elem, ...{ detail: { ...restDetail, children: [] } } });

      currentGroupQueue.push(elem as Element<'group'>);
      children.forEach((child) => {
        _walk(child);
      });
      currentGroupQueue.pop();
    } else {
      _resetElemSize(elem);
    }
  };
  for (let i = 0; i < list.length; i++) {
    const elem = list[i];
    _walk(elem);
  }

  return elemeList;
}
