import type { Data, ViewSizeInfo, Element, ElementSize, ViewScaleInfo, PointSize } from '@idraw/types';
import { rotateElementVertexes } from './rotate';
import {} from './view-calc';
import { formatNumber } from './number';
import { is } from './is';

interface ViewCenterContentResult {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function calcViewCenterContent(data: Data, opts: { viewSizeInfo: ViewSizeInfo }): ViewCenterContentResult {
  let offsetX: number = 0;
  let offsetY: number = 0;
  let scale: number = 1;

  let contentX: number = data?.elements?.[0]?.x || 0;
  let contentY: number = data?.elements?.[0]?.y || 0;
  let contentW: number = data?.elements?.[0]?.w || 0;
  let contentH: number = data?.elements?.[0]?.h || 0;
  const { width, height } = opts.viewSizeInfo;

  if (data.layout && data.layout?.detail?.overflow === 'hidden') {
    contentX = 0;
    contentY = 0;
    contentW = data.layout.w || 0;
    contentH = data.layout.h || 0;
  } else {
    data.elements.forEach((elem: Element) => {
      const elemSize: ElementSize = {
        x: elem.x,
        y: elem.y,
        w: elem.w,
        h: elem.h,
        angle: elem.angle
      };
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
      const areaStartX = Math.min(elemSize.x, contentX);
      const areaStartY = Math.min(elemSize.y, contentY);

      const areaEndX = Math.max(elemSize.x + elemSize.w, contentX + contentW);
      const areaEndY = Math.max(elemSize.y + elemSize.h, contentY + contentH);

      contentX = areaStartX;
      contentY = areaStartY;
      contentW = Math.abs(areaEndX - areaStartX);
      contentH = Math.abs(areaEndY - areaStartY);
    });
  }

  if (data.layout) {
    const { x, y, w, h } = data.layout;
    if (is.x(x) && is.y(y) && is.w(w) && is.h(h)) {
      contentX = Math.min(contentX, x);
      contentY = Math.min(contentY, y);
      contentW = Math.max(contentW, w);
      contentH = Math.max(contentH, h);
    }
  }

  if (contentW > 0 && contentH > 0) {
    const scaleW = formatNumber(width / contentW, { decimalPlaces: 4 });
    const scaleH = formatNumber(height / contentH, { decimalPlaces: 4 });
    scale = Math.min(scaleW, scaleH, 1);
    offsetX = (contentW * scale - width) / 2 / scale + contentX;
    offsetY = (contentH * scale - height) / 2 / scale + contentY;
  }

  const result: ViewCenterContentResult = {
    offsetX: formatNumber(offsetX, { decimalPlaces: 0 }),
    offsetY: formatNumber(offsetY, { decimalPlaces: 0 }),
    scale
  };

  return result;
}

export function calcViewCenter(opts?: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): PointSize {
  let x = 0;
  let y = 0;

  if (opts) {
    const { viewScaleInfo, viewSizeInfo } = opts;
    const { offsetLeft, offsetTop, scale } = viewScaleInfo;
    const { width, height } = viewSizeInfo;
    x = 0 - offsetLeft + width / scale / 2;
    y = 0 - offsetTop + height / scale / 2;
  }
  const p: PointSize = {
    x,
    y
  };
  return p;
}
