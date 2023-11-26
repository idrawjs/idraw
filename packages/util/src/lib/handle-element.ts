import type { Data, RecursivePartial, Element, ElementSize, ElementType, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';
import { createUUID } from './uuid';
import {
  getDefaultElementDetailConfig,
  getDefaultElementRectDetail,
  getDefaultElementCircleDetail,
  getDefaultElementTextDetail,
  getDefaultElementSVGDetail,
  getDefaultElementImageDetail
} from './config';

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

export function addElement(data: Data) {
  // TODO
}
