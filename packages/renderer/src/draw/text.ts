import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement } from '@idraw/util';
import { is, isColorStr } from '@idraw/util';
import { drawBox } from './base';

export function drawText(ctx: ViewContext2D, elem: Element<'text'>, opts: RendererDrawElementOptions) {
  const { calculator, scaleInfo } = opts;
  const { x, y, w, h, angle } = calculator.elementSize(elem, scaleInfo);
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    drawBox(ctx, { ...elem, ...{ x, y, w, h, angle } }, elem.desc.bgColor || 'transparent');
    const desc: Element<'text'>['desc'] = {
      ...{
        fontSize: 12,
        fontFamily: 'sans-serif',
        textAlign: 'center'
      },
      ...elem.desc
    };
    ctx.fillStyle = elem.desc.color;
    ctx.textBaseline = 'top';
    ctx.$setFont({
      fontWeight: desc.fontWeight,
      fontSize: desc.fontSize,
      fontFamily: desc.fontFamily
    });
    const descText = desc.text.replace(/\r\n/gi, '\n');
    const fontHeight = desc.lineHeight || desc.fontSize;
    const descTextList = descText.split('\n');
    const lines: { text: string; width: number }[] = [];

    let lineNum = 0;
    descTextList.forEach((tempText: string, idx: number) => {
      let lineText = '';

      if (tempText.length > 0) {
        for (let i = 0; i < tempText.length; i++) {
          if (ctx.measureText(lineText + (tempText[i] || '')).width < ctx.$doPixelRatio(w)) {
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
            if ((lineNum + 1) * fontHeight < h) {
              lines.push({
                text: lineText,
                width: ctx.$undoPixelRatio(ctx.measureText(lineText).width)
              });
              if (idx < descTextList.length - 1) {
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
    });

    let startY = 0;
    if (lines.length * fontHeight < h) {
      if (elem.desc.verticalAlign === 'top') {
        startY = 0;
      } else if (elem.desc.verticalAlign === 'bottom') {
        startY += h - lines.length * fontHeight;
      } else {
        // middle and default
        startY += (h - lines.length * fontHeight) / 2;
      }
    }

    // draw text lines
    {
      const _y = y + startY;
      if (desc.textShadowColor !== undefined && isColorStr(desc.textShadowColor)) {
        ctx.shadowColor = desc.textShadowColor;
      }
      if (desc.textShadowOffsetX !== undefined && is.number(desc.textShadowOffsetX)) {
        ctx.shadowOffsetX = desc.textShadowOffsetX;
      }
      if (desc.textShadowOffsetY !== undefined && is.number(desc.textShadowOffsetY)) {
        ctx.shadowOffsetY = desc.textShadowOffsetY;
      }
      if (desc.textShadowBlur !== undefined && is.number(desc.textShadowBlur)) {
        ctx.shadowBlur = desc.textShadowBlur;
      }
      lines.forEach((line, i) => {
        let _x = x;
        if (desc.textAlign === 'center') {
          _x = x + (w - line.width) / 2;
        } else if (desc.textAlign === 'right') {
          _x = x + (w - line.width);
        }
        ctx.fillText(line.text, _x, _y + fontHeight * i);
      });
    }

    // draw text stroke
    if (isColorStr(desc.strokeColor) && desc.strokeWidth !== undefined && desc.strokeWidth > 0) {
      const _y = y + startY;
      lines.forEach((line, i) => {
        let _x = x;
        if (desc.textAlign === 'center') {
          _x = x + (w - line.width) / 2;
        } else if (desc.textAlign === 'right') {
          _x = x + (w - line.width);
        }
        if (desc.strokeColor !== undefined) {
          ctx.strokeStyle = desc.strokeColor;
        }
        if (desc.strokeWidth !== undefined && desc.strokeWidth > 0) {
          ctx.lineWidth = desc.strokeWidth;
        }
        ctx.strokeText(line.text, _x, _y + fontHeight * i);
      });
    }
  });
}
