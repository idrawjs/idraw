import type { Data, ViewSizeInfo, Element, ElementSize } from 'idraw';
import { rotateElementVertexes } from './rotate';
import {} from './view-calc';
import { formatNumber } from './number';

interface ViewCenterContentResult {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function calcViewCenterContent(data: Data, opts: { viewSizeInfo: ViewSizeInfo }): ViewCenterContentResult {
  let offsetX: number = 0;
  let offsetY: number = 0;
  let scale: number = 0;

  let contentX: number = 0;
  let contentY: number = 0;
  let contentW: number = 0;
  let contentH: number = 0;

  const { width, height } = opts.viewSizeInfo;

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

  if (contentW > 0 && contentH > 0) {
    const scaleW = formatNumber(width / contentW, { decimalPlaces: 4 });
    const scaleH = formatNumber(height / contentH, { decimalPlaces: 4 });
    scale = Math.min(scaleW, scaleH, 1);
    offsetX = (contentW * scale - width) / 2 / scale;
    offsetY = (contentH * scale - height) / 2 / scale;
  }

  const result: ViewCenterContentResult = {
    offsetX: formatNumber(offsetX, { decimalPlaces: 0 }),
    offsetY: formatNumber(offsetY, { decimalPlaces: 0 }),
    scale
  };
  return result;
}
