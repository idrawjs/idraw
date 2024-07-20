import type { BoardMiddleware, ViewRectInfo, Element, MiddlewareInfoConfig, CoreEventMap } from '@idraw/types';
import { formatNumber, getViewScaleInfoFromSnapshot, getViewSizeInfoFromSnapshot, createUUID, limitAngle, rotatePoint, parseAngleToRadian } from '@idraw/util';
import { keySelectedElementList, keyActionType, keyGroupQueue } from '../selector';
import { drawSizeInfoText, drawPositionInfoText, drawAngleInfoText } from './draw-info';
import type { DeepInfoSharedStorage } from './types';
import { defaltStyle } from './config';

const infoFontSize = 10;
const infoLineHeight = 16;

export const MiddlewareInfo: BoardMiddleware<DeepInfoSharedStorage, CoreEventMap, MiddlewareInfoConfig> = (opts, config) => {
  const { boardContent, calculator } = opts;
  const { overlayContext } = boardContent;
  const innerConfig = {
    ...defaltStyle,
    ...config
  };
  const { textBackground, textColor } = innerConfig;
  const style = {
    textBackground,
    textColor
  };

  return {
    name: '@middleware/info',

    beforeDrawFrame({ snapshot }) {
      const { sharedStore } = snapshot;

      const selectedElementList = sharedStore[keySelectedElementList];
      const actionType = sharedStore[keyActionType];
      const groupQueue = sharedStore[keyGroupQueue] || [];

      if (selectedElementList.length === 1) {
        const elem = selectedElementList[0];
        if (elem && ['select', 'drag', 'resize'].includes(actionType as string)) {
          const viewScaleInfo = getViewScaleInfoFromSnapshot(snapshot);
          const viewSizeInfo = getViewSizeInfoFromSnapshot(snapshot);
          const { x, y, w, h, angle } = elem;
          const totalGroupQueue = [
            ...groupQueue,
            ...[
              {
                uuid: createUUID(),
                x,
                y,
                w,
                h,
                angle,
                type: 'group',
                detail: { children: [] }
              } as Element<'group'>
            ]
          ];

          const calcOpts = { viewScaleInfo, viewSizeInfo };

          const rangeRectInfo = calculator.calcViewRectInfoFromOrigin(elem.uuid, calcOpts);
          let totalAngle = 0;
          totalGroupQueue.forEach((group) => {
            totalAngle += group.angle || 0;
          });
          const totalRadian = parseAngleToRadian(limitAngle(0 - totalAngle));

          if (rangeRectInfo) {
            const elemCenter = rangeRectInfo?.center;
            const rectInfo: ViewRectInfo = {
              topLeft: rotatePoint(elemCenter, rangeRectInfo.topLeft, totalRadian),
              topRight: rotatePoint(elemCenter, rangeRectInfo.topRight, totalRadian),
              bottomRight: rotatePoint(elemCenter, rangeRectInfo.bottomRight, totalRadian),
              bottomLeft: rotatePoint(elemCenter, rangeRectInfo.bottomLeft, totalRadian),
              center: rotatePoint(elemCenter, rangeRectInfo.center, totalRadian),
              top: rotatePoint(elemCenter, rangeRectInfo.top, totalRadian),
              right: rotatePoint(elemCenter, rangeRectInfo.right, totalRadian),
              bottom: rotatePoint(elemCenter, rangeRectInfo.bottom, totalRadian),
              left: rotatePoint(elemCenter, rangeRectInfo.left, totalRadian)
            };

            const x = formatNumber(elem.x, { decimalPlaces: 2 });
            const y = formatNumber(elem.y, { decimalPlaces: 2 });
            const w = formatNumber(elem.w, { decimalPlaces: 2 });
            const h = formatNumber(elem.h, { decimalPlaces: 2 });

            // // test start ----
            // const ctx = overlayContext;
            // ctx.beginPath();
            // ctx.moveTo(rectInfo.topLeft.x, rectInfo.topLeft.y);
            // ctx.lineTo(rectInfo.topRight.x, rectInfo.topRight.y);
            // ctx.lineTo(rectInfo.bottomRight.x, rectInfo.bottomRight.y);
            // ctx.lineTo(rectInfo.bottomLeft.x, rectInfo.bottomLeft.y);
            // ctx.closePath();
            // ctx.strokeStyle = 'red';
            // ctx.stroke();
            // // test end ----

            const xyText = `${formatNumber(x, { decimalPlaces: 0 })},${formatNumber(y, { decimalPlaces: 0 })}`;
            const whText = `${formatNumber(w, { decimalPlaces: 0 })}x${formatNumber(h, { decimalPlaces: 0 })}`;
            const angleText = `${formatNumber(elem.angle || 0, { decimalPlaces: 0 })}°`;

            drawSizeInfoText(overlayContext, {
              point: {
                x: rectInfo.bottom.x,
                y: rectInfo.bottom.y + infoFontSize
              },
              rotateCenter: rectInfo.center,
              angle: totalAngle,
              text: whText,
              fontSize: infoFontSize,
              lineHeight: infoLineHeight,
              style
            });

            drawPositionInfoText(overlayContext, {
              point: {
                x: rectInfo.topLeft.x,
                y: rectInfo.topLeft.y - infoFontSize * 2
              },
              rotateCenter: rectInfo.center,
              angle: totalAngle,
              text: xyText,
              fontSize: infoFontSize,
              lineHeight: infoLineHeight,
              style
            });

            drawAngleInfoText(overlayContext, {
              point: {
                x: rectInfo.top.x + infoFontSize,
                y: rectInfo.top.y - infoFontSize * 2
              },
              rotateCenter: rectInfo.center,
              angle: totalAngle,
              text: angleText,
              fontSize: infoFontSize,
              lineHeight: infoLineHeight,
              style
            });
          }
        }
      }
    }
  };
};
