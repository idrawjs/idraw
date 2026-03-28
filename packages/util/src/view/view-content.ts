import type { Data, ViewSizeInfo, Material, MaterialSize, ViewScaleInfo, Point } from '@idraw/types';
import { rotateMaterialVertexes } from './rotate';
import {} from './view-calc';
import { formatNumber } from '../tool/number';
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

  let contentX: number = data?.materials?.[0]?.x || 0;
  let contentY: number = data?.materials?.[0]?.y || 0;
  let contentW: number = data?.materials?.[0]?.width || 0;
  let contentH: number = data?.materials?.[0]?.height || 0;
  const { width, height } = opts.viewSizeInfo;

  if (is.layout(data.layout) && data.layout?.overflow === 'hidden') {
    contentX = data.layout.x;
    contentY = data.layout.y;
    contentW = data.layout.width || 0;
    contentH = data.layout.height || 0;
  } else {
    data.materials.forEach((mtrl: Material) => {
      const mtrlSize: MaterialSize = {
        x: mtrl.x,
        y: mtrl.y,
        width: mtrl.width,
        height: mtrl.height,
        angle: mtrl.angle,
      };
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
      const areaStartX = Math.min(mtrlSize.x, contentX);
      const areaStartY = Math.min(mtrlSize.y, contentY);

      const areaEndX = Math.max(mtrlSize.x + mtrlSize.width, contentX + contentW);
      const areaEndY = Math.max(mtrlSize.y + mtrlSize.height, contentY + contentH);

      contentX = areaStartX;
      contentY = areaStartY;
      contentW = Math.abs(areaEndX - areaStartX);
      contentH = Math.abs(areaEndY - areaStartY);
    });
  }

  if (data?.layout && is.layout(data.layout)) {
    const { x, y, width, height } = data.layout;
    if (data.layout?.overflow === 'hidden') {
      contentX = Math.min(contentX, x);
      contentY = Math.min(contentY, y);
      contentW = Math.min(contentW, width);
      contentH = Math.min(contentH, height);
    } else {
      contentX = Math.min(contentX, x);
      contentY = Math.min(contentY, y);
      contentW = Math.max(contentW, width);
      contentH = Math.max(contentH, height);
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
    scale,
  };

  return result;
}

export function calcViewCenter(opts?: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): Point {
  let x = 0;
  let y = 0;

  if (opts) {
    const { viewScaleInfo, viewSizeInfo } = opts;
    const { offsetLeft, offsetTop, scale } = viewScaleInfo;
    const { width, height } = viewSizeInfo;
    x = 0 - offsetLeft + width / scale / 2;
    y = 0 - offsetTop + height / scale / 2;
  }
  const p: Point = {
    x,
    y,
  };
  return p;
}
