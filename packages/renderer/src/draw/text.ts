import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement, calcViewElementSize } from '@idraw/util';
import { is, isColorStr, getDefaultElementDetailConfig } from '@idraw/util';
import { drawBox } from './box';

const detailConfig = getDefaultElementDetailConfig();

export function drawText(ctx: ViewContext2D, elem: Element<'text'>, opts: RendererDrawElementOptions) {
  const { viewScaleInfo, viewSizeInfo, parentOpacity } = opts;
  const { x, y, w, h, angle } = calcViewElementSize(elem, { viewScaleInfo }) || elem;
  const viewElem = { ...elem, ...{ x, y, w, h, angle } };
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    drawBox(ctx, viewElem, {
      originElem: elem,
      calcElemSize: { x, y, w, h, angle },
      viewScaleInfo,
      viewSizeInfo,
      parentOpacity,
      renderContent: () => {
        const detail: Element<'text'>['detail'] = {
          ...detailConfig,
          ...elem.detail
        };
        const originFontSize = detail.fontSize || detailConfig.fontSize;
        const fontSize = originFontSize * viewScaleInfo.scale;

        const originLineHeight = detail.lineHeight || originFontSize;
        const lineHeight = originLineHeight * viewScaleInfo.scale;

        ctx.fillStyle = elem.detail.color || detailConfig.color;
        ctx.textBaseline = 'top';
        ctx.$setFont({
          fontWeight: detail.fontWeight,
          fontSize: fontSize,
          fontFamily: detail.fontFamily
        });
        let detailText = detail.text.replace(/\r\n/gi, '\n');
        if (detail.textTransform === 'lowercase') {
          detailText = detailText.toLowerCase();
        } else if (detail.textTransform === 'uppercase') {
          detailText = detailText.toUpperCase();
        }

        const fontHeight = lineHeight;
        const detailTextList = detailText.split('\n');
        const lines: { text: string; width: number }[] = [];

        let lineNum = 0;
        detailTextList.forEach((tempText: string, idx: number) => {
          if (detail.minInlineSize === 'maxContent') {
            lines.push({
              text: tempText,
              width: ctx.$undoPixelRatio(ctx.measureText(tempText).width)
            });
          } else {
            let lineText = '';
            if (tempText.length > 0) {
              for (let i = 0; i < tempText.length; i++) {
                if (ctx.measureText(lineText + (tempText[i] || '')).width <= ctx.$doPixelRatio(w)) {
                  lineText += tempText[i] || '';
                } else {
                  lines.push({
                    text: lineText,
                    width: ctx.$undoPixelRatio(ctx.measureText(lineText).width)
                  });
                  lineText = tempText[i] || '';
                  lineNum++;
                }
                if ((lineNum + 1) * fontHeight > h) {
                  break;
                }
                if (tempText.length - 1 === i) {
                  if ((lineNum + 1) * fontHeight <= h) {
                    lines.push({
                      text: lineText,
                      width: ctx.$undoPixelRatio(ctx.measureText(lineText).width)
                    });
                    if (idx < detailTextList.length - 1) {
                      lineNum++;
                    }
                    break;
                  }
                }
              }
            } else {
              lines.push({
                text: '',
                width: 0
              });
            }
          }
        });

        let startY = 0;
        if (lines.length * fontHeight < h) {
          if (elem.detail.verticalAlign === 'top') {
            startY = 0;
          } else if (elem.detail.verticalAlign === 'bottom') {
            startY += h - lines.length * fontHeight;
          } else {
            // middle and default
            startY += (h - lines.length * fontHeight) / 2;
          }
        }

        // draw text lines
        {
          const _y = y + startY;
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
          lines.forEach((line, i) => {
            let _x = x;
            if (detail.textAlign === 'center') {
              _x = x + (w - line.width) / 2;
            } else if (detail.textAlign === 'right') {
              _x = x + (w - line.width);
            }
            ctx.fillText(line.text, _x, _y + fontHeight * i);
          });
        }

        // // draw text stroke
        // if (isColorStr(detail.strokeColor) && detail.strokeWidth !== undefined && detail.strokeWidth > 0) {
        //   const _y = y + startY;
        //   lines.forEach((line, i) => {
        //     let _x = x;
        //     if (detail.textAlign === 'center') {
        //       _x = x + (w - line.width) / 2;
        //     } else if (detail.textAlign === 'right') {
        //       _x = x + (w - line.width);
        //     }
        //     if (detail.strokeColor !== undefined) {
        //       ctx.strokeStyle = detail.strokeColor;
        //     }
        //     if (detail.strokeWidth !== undefined && detail.strokeWidth > 0) {
        //       ctx.lineWidth = detail.strokeWidth;
        //     }
        //     ctx.strokeText(line.text, _x, _y + fontHeight * i);
        //   });
        // }
      }
    });
  });
}
