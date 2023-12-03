import type { RecursivePartial, Element, Elements, ElementPosition, ElementSize, ElementType, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';
import { createUUID } from './uuid';
import {
  getDefaultElementDetailConfig,
  getDefaultElementRectDetail,
  getDefaultElementCircleDetail,
  getDefaultElementTextDetail,
  getDefaultElementSVGDetail,
  getDefaultElementImageDetail,
  getDefaultElementGroupDetail
} from './config';
import { findElementFromListByPosition, insertElementToListByPosition, deleteElementInListByPosition } from './element';

const defaultViewWidth = 200;
const defaultViewHeight = 200;
const defaultDetail = getDefaultElementDetailConfig();

function createElementSize(type: ElementType, opts?: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): ElementSize {
  let x = 0;
  let y = 0;
  let w = defaultViewWidth;
  let h = defaultViewHeight;

  if (opts) {
    const { viewScaleInfo, viewSizeInfo } = opts;
    const { scale, offsetLeft, offsetTop } = viewScaleInfo;
    const { width, height } = viewSizeInfo;
    if (type === 'text') {
      const textDetail = getDefaultElementTextDetail();
      w = defaultDetail.fontSize * scale * textDetail.text.length;
      h = defaultDetail.fontSize * scale * 2;
    } else {
      const limitViewWidth = width / 4;
      const limitViewHeight = height / 4;
      if (defaultViewWidth >= limitViewWidth) {
        w = limitViewWidth / scale;
      } else {
        w = defaultViewWidth / scale;
      }

      if (defaultViewHeight >= limitViewHeight) {
        h = limitViewHeight / scale;
      } else {
        h = defaultViewHeight / scale;
      }
      if (['circle', 'svg', 'image'].includes(type)) {
        w = h = Math.max(w, h);
      }
    }

    x = (0 - offsetLeft + width / 2 - (w * scale) / 2) / scale;
    y = (0 - offsetTop + height / 2 - (h * scale) / 2) / scale;
  }

  const elemSize: ElementSize = {
    x,
    y,
    w,
    h
  };

  return elemSize;
}

export function createElement<T extends ElementType>(
  type: T,
  baseElem: RecursivePartial<Element<T>>,
  opts?: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    limitRatio?: boolean;
  }
): Element<T> {
  const elemSize = createElementSize(type, opts);
  let detail = {};
  if (type === 'rect') {
    detail = getDefaultElementRectDetail();
  } else if (type === 'circle') {
    detail = getDefaultElementCircleDetail({
      radius: elemSize.w
    });
  } else if (type === 'text') {
    detail = getDefaultElementTextDetail(opts);
  } else if (type === 'svg') {
    detail = getDefaultElementSVGDetail();
  } else if (type === 'image') {
    detail = getDefaultElementImageDetail();
  } else if (type === 'group') {
    detail = getDefaultElementGroupDetail();
  }
  const elem: Element<T> = {
    ...elemSize,
    ...baseElem,
    uuid: createUUID(),
    type,
    detail: {
      ...detail,
      ...(baseElem.detail || {})
    }
  } as Element<T>;
  return elem;
}

export function moveElementPosition(
  elements: Elements,
  opts: {
    from: ElementPosition;
    to: ElementPosition;
  }
): Elements {
  const { from, to } = opts;

  // [] -> [1,2,3] or [1, 2 ,3] -> []
  if (from.length === 0 || to.length === 0) {
    return elements;
  }

  // [1] -> [1, 2, 3]
  if (from.length <= to.length) {
    for (let i = 0; i < from.length; i++) {
      if (to[i] === from[i]) {
        if (i === from.length - 1) {
          return elements;
        }
        continue;
      }
    }
  }

  const target = findElementFromListByPosition(from, elements);
  if (target) {
    const insterResult = insertElementToListByPosition(target, to, elements);
    if (!insterResult) {
      return elements;
    }

    let trimDeletePosIndex = -1;
    const trimDeletePosAction = 'down'; // +1

    for (let i = 0; i < from.length; i++) {
      if (!(to[i] >= 0)) {
        break;
      }
      if (to[i] === from[i]) {
        continue;
      }
      if (to[i] < from[i] && i == to.length - 1) {
        trimDeletePosIndex = i;
      }
    }

    if (trimDeletePosIndex >= 0) {
      if (trimDeletePosAction === 'down') {
        from[trimDeletePosIndex] = from[trimDeletePosIndex] + 1;
      }
    }

    deleteElementInListByPosition(from, elements);
  }
  return elements;
}
