import type { StrictMaterial, RendererDrawMaterialOptions, ViewContext2D } from '@idraw/types';
import { enhanceFontFamliy, calcViewMaterialSize } from '@idraw/util';
import { getDefaultMaterialAttributes } from '@idraw/util';
import { rotateViewMaterial, drawClipPath } from './base';
import { createColor } from './color';

const defaultAttrs = getDefaultMaterialAttributes();

export function drawText(ctx: ViewContext2D, mtrl: StrictMaterial<'text'>, opts: RendererDrawMaterialOptions) {
  const { viewScaleInfo, viewSizeInfo, calculator } = opts;
  const viewMaterialSize = calcViewMaterialSize(mtrl, { viewScaleInfo }) || mtrl;

  const { scale } = viewScaleInfo;

  rotateViewMaterial(ctx, mtrl, opts, ({ viewWorldSize }) => {
    {
      const attributes = {
        ...defaultAttrs,
        ...mtrl,
      };
      const { x, y } = viewWorldSize;

      const originFontSize = attributes.fontSize || defaultAttrs.fontSize;
      const fontSize = originFontSize * viewScaleInfo.scale;

      const {
        opacity,
        fill,
        fillOpacity,
        stroke,
        strokeWidth,
        strokeOpacity,
        strokeLinecap,
        strokeLinejoin,
        strokeDasharray,
        strokeDashoffset,
        strokeMiterlimit,
      } = attributes;

      if (fontSize < 2) {
        return;
      }

      const originGlobalAlpha = ctx.globalAlpha;
      const virtualTextAttributes = calculator.getVirtualItem(mtrl.id);
      ctx.textBaseline = 'top';
      ctx.$setFont({
        fontWeight: attributes.fontWeight,
        fontSize: fontSize,
        fontFamily: enhanceFontFamliy(attributes.fontFamily),
      });

      drawClipPath(ctx, mtrl, {
        viewScaleInfo,
        viewSizeInfo,
        calculator,
        renderContent: () => {
          // fill
          if (fill) {
            if (typeof fillOpacity === 'number' && fillOpacity > 0) {
              ctx.globalAlpha = originGlobalAlpha * fillOpacity * opacity;
            }
            ctx.fillStyle = createColor(ctx, fill, { viewMaterialSize, viewScaleInfo, opacity: mtrl.opacity || 1 });
            if (Array.isArray(virtualTextAttributes?.textLines) && virtualTextAttributes?.textLines?.length > 0) {
              virtualTextAttributes?.textLines?.forEach((line) => {
                ctx.fillText(line.text, x + line.x * viewScaleInfo.scale, y + line.y * viewScaleInfo.scale);
              });
            }
            ctx.globalAlpha = originGlobalAlpha;
          }

          // stroke
          if (typeof strokeWidth === 'number' && strokeWidth > 0) {
            if (typeof strokeOpacity === 'number' && strokeOpacity > 0) {
              ctx.globalAlpha = originGlobalAlpha * strokeOpacity * opacity;
            }

            ctx.lineCap = strokeLinecap;
            ctx.lineJoin = strokeLinejoin;
            ctx.lineDashOffset = strokeDashoffset;
            ctx.miterLimit = strokeMiterlimit;

            if (Array.isArray(strokeDasharray)) {
              const lineDash = strokeDasharray.map((dash) => scale * dash);
              ctx.setLineDash(lineDash);
            }
            ctx.lineWidth = strokeWidth * scale;
            ctx.strokeStyle = stroke as string; // TODO

            virtualTextAttributes?.textLines?.forEach((line) => {
              ctx.strokeText(line.text, x + line.x * viewScaleInfo.scale, y + line.y * viewScaleInfo.scale);
            });
            ctx.setLineDash([]);

            // reset
            ctx.lineCap = defaultAttrs.strokeLinecap;
            ctx.lineJoin = defaultAttrs.strokeLinejoin;
            ctx.lineDashOffset = defaultAttrs.strokeDashoffset;
            ctx.miterLimit = defaultAttrs.strokeMiterlimit;
            ctx.globalAlpha = originGlobalAlpha;
          }
        },
      });
    }
  });
}
