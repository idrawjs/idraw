import type { Middleware, BoundingInfo, Material, MiddlewareInfoConfig, CoreEventMap } from '@idraw/types';
import {
  formatNumber,
  getViewScaleInfoFromSnapshot,
  getViewSizeInfoFromSnapshot,
  createUUID,
  limitAngle,
  rotatePoint,
  parseAngleToRadian,
} from '@idraw/util';
import { keySelectedMaterialList, keyActionType, keyGroupQueue } from '../selector';
import { drawSizeInfoText, drawPositionInfoText, drawAngleInfoText } from './draw-info';
import type { DeepInfoSharedStorage } from './types';
import { defaltStyle, MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE, getMiddlewareInfoStyles } from './static';

export { MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE };

const infoFontSize = 10;
const infoLineHeight = 16;

export { getMiddlewareInfoStyles };

export const MiddlewareInfo: Middleware<
  DeepInfoSharedStorage,
  CoreEventMap & {
    [MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE]: { show: boolean };
  },
  MiddlewareInfoConfig
> = (opts, config) => {
  const { boardContent, calculator, eventHub } = opts;
  const { overlayContext } = boardContent;
  let innerConfig = {
    ...defaltStyle,
    ...config,
  };
  const styles = getMiddlewareInfoStyles(innerConfig);

  let showAngleInfo = true;

  const showInfoAngleCallback = ({ show }: { show: boolean }) => {
    showAngleInfo = show;
  };

  return {
    name: '@middleware/info',

    use() {
      eventHub.on(MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE, showInfoAngleCallback);
    },

    disuse() {
      eventHub.off(MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE, showInfoAngleCallback);
    },

    resetConfig(config) {
      innerConfig = { ...innerConfig, ...config };
    },

    beforeDrawFrame({ snapshot }) {
      const { sharedStore } = snapshot;

      const selectedMaterialList = sharedStore[keySelectedMaterialList];
      const actionType = sharedStore[keyActionType];
      const groupQueue = sharedStore[keyGroupQueue] || [];

      if (selectedMaterialList?.length === 1) {
        const mtrl = selectedMaterialList[0];
        if (mtrl && ['select', 'drag', 'resize'].includes(actionType as string)) {
          const viewScaleInfo = getViewScaleInfoFromSnapshot(snapshot);
          const viewSizeInfo = getViewSizeInfoFromSnapshot(snapshot);
          const { x, y, width, height, angle } = mtrl;
          const totalGroupQueue = [
            ...groupQueue,
            ...[
              {
                id: createUUID(),
                x,
                y,
                width,
                height,
                angle,
                type: 'group',
                children: [],
              } as Material,
            ],
          ];

          const calcOpts = { viewScaleInfo, viewSizeInfo };

          const rangeBoundingInfo = calculator.calcViewBoundingInfoFromOrigin(mtrl.id, calcOpts);
          let totalAngle = 0;
          totalGroupQueue.forEach((group) => {
            totalAngle += group.angle || 0;
          });
          const totalRadian = parseAngleToRadian(limitAngle(0 - totalAngle));

          if (rangeBoundingInfo) {
            const mtrlCenter = rangeBoundingInfo?.center;
            const boundingBox: BoundingInfo = {
              topLeft: rotatePoint(mtrlCenter, rangeBoundingInfo.topLeft, totalRadian),
              topRight: rotatePoint(mtrlCenter, rangeBoundingInfo.topRight, totalRadian),
              bottomRight: rotatePoint(mtrlCenter, rangeBoundingInfo.bottomRight, totalRadian),
              bottomLeft: rotatePoint(mtrlCenter, rangeBoundingInfo.bottomLeft, totalRadian),
              center: rotatePoint(mtrlCenter, rangeBoundingInfo.center, totalRadian),
              top: rotatePoint(mtrlCenter, rangeBoundingInfo.top, totalRadian),
              right: rotatePoint(mtrlCenter, rangeBoundingInfo.right, totalRadian),
              bottom: rotatePoint(mtrlCenter, rangeBoundingInfo.bottom, totalRadian),
              left: rotatePoint(mtrlCenter, rangeBoundingInfo.left, totalRadian),
            };

            const x = formatNumber(mtrl.x, { decimalPlaces: 2 });
            const y = formatNumber(mtrl.y, { decimalPlaces: 2 });
            const w = formatNumber(mtrl.width, { decimalPlaces: 2 });
            const h = formatNumber(mtrl.height, { decimalPlaces: 2 });

            // // test start ----
            // const ctx = overlayContext;
            // ctx.beginPath();
            // ctx.moveTo(boundingBox.topLeft.x, boundingBox.topLeft.y);
            // ctx.lineTo(boundingBox.topRight.x, boundingBox.topRight.y);
            // ctx.lineTo(boundingBox.bottomRight.x, boundingBox.bottomRight.y);
            // ctx.lineTo(boundingBox.bottomLeft.x, boundingBox.bottomLeft.y);
            // ctx.closePath();
            // ctx.strokeStyle = 'red';
            // ctx.stroke();
            // // test end ----

            const xyText = `${formatNumber(x, { decimalPlaces: 0 })},${formatNumber(y, { decimalPlaces: 0 })}`;
            const whText = `${formatNumber(w, { decimalPlaces: 0 })}x${formatNumber(h, { decimalPlaces: 0 })}`;
            const angleText = `${formatNumber(limitAngle(mtrl.angle || 0), { decimalPlaces: 0 })}°`;

            drawSizeInfoText(overlayContext, {
              point: {
                x: boundingBox.bottom.x,
                y: boundingBox.bottom.y + infoFontSize,
              },
              rotateCenter: boundingBox.center,
              angle: totalAngle,
              text: whText,
              fontSize: infoFontSize,
              lineHeight: infoLineHeight,
              styles,
            });

            drawPositionInfoText(overlayContext, {
              point: {
                x: boundingBox.topLeft.x,
                y: boundingBox.topLeft.y - infoFontSize * 2,
              },
              rotateCenter: boundingBox.center,
              angle: totalAngle,
              text: xyText,
              fontSize: infoFontSize,
              lineHeight: infoLineHeight,
              styles,
            });

            if (showAngleInfo) {
              if (mtrl.operations?.rotatable !== false) {
                drawAngleInfoText(overlayContext, {
                  point: {
                    x: boundingBox.top.x + infoFontSize + 4,
                    y: boundingBox.top.y - infoFontSize * 2 - 18,
                  },
                  rotateCenter: boundingBox.center,
                  angle: totalAngle,
                  text: angleText,
                  fontSize: infoFontSize,
                  lineHeight: infoLineHeight,
                  styles,
                });
              }
            }
          }
        }
      }
    },
  };
};
