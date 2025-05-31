import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement, calcViewElementSize, enhanceFontFamliy } from '@idraw/util';
import { is, isColorStr, getDefaultElementDetailConfig } from '@idraw/util';
import { drawBox, drawBoxShadow, getOpacity } from './box';

const detailConfig = getDefaultElementDetailConfig();

export function drawText(ctx: ViewContext2D, elem: Element<'text'>, opts: RendererDrawElementOptions) {
  const { viewScaleInfo, viewSizeInfo, parentOpacity, calculator } = opts;
  const { x, y, w, h, angle } = calcViewElementSize(elem, { viewScaleInfo }) || elem;
  const viewElem = { ...elem, ...{ x, y, w, h, angle } };
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    drawBoxShadow(ctx, viewElem, {
      viewScaleInfo,
      viewSizeInfo,
      renderContent: () => {
        drawBox(ctx, viewElem, {
          originElem: elem,
          calcElemSize: { x, y, w, h, angle },
          viewScaleInfo,
          viewSizeInfo,
          parentOpacity
        });
      }
    });
    {
      const detail: Element<'text'>['detail'] = {
        ...detailConfig,
        ...elem.detail
      };
      const originFontSize = detail.fontSize || detailConfig.fontSize;
      const fontSize = originFontSize * viewScaleInfo.scale;

      if (fontSize < 2) {
        return;
      }

      const { parentOpacity } = opts;
      const opacity = getOpacity(elem) * parentOpacity;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = elem.detail.color || detailConfig.color;
      ctx.textBaseline = 'top';
      ctx.$setFont({
        fontWeight: detail.fontWeight,
        fontSize: fontSize,
        fontFamily: enhanceFontFamliy(detail.fontFamily)
      });

      {
        const virtualTextDetail = calculator.getVirtualFlatItem(elem.uuid);
        if (Array.isArray(virtualTextDetail?.textLines) && virtualTextDetail?.textLines?.length > 0) {
          if (detail.textShadowColor !== undefined && isColorStr(detail.textShadowColor)) {
            ctx.shadowColor = detail.textShadowColor;
          }
          if (detail.textShadowOffsetX !== undefined && is.number(detail.textShadowOffsetX)) {
            ctx.shadowOffsetX = detail.textShadowOffsetX;
          }
          if (detail.textShadowOffsetY !== undefined && is.number(detail.textShadowOffsetY)) {
            ctx.shadowOffsetY = detail.textShadowOffsetY;
          }
          if (detail.textShadowBlur !== undefined && is.number(detail.textShadowBlur)) {
            ctx.shadowBlur = detail.textShadowBlur;
          }

          virtualTextDetail?.textLines?.forEach((line) => {
            ctx.fillText(line.text, x + line.x * viewScaleInfo.scale, y + line.y * viewScaleInfo.scale);
          });
        }
      }

      ctx.globalAlpha = parentOpacity;
    }
  });
}
