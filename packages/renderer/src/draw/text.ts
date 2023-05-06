import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement } from '@idraw/util';
import { is, isColorStr } from '@idraw/util';
import { clearContext, drawBox } from './base';

export function drawText(ctx: ViewContext2D, elem: Element<'text'>, opts: RendererDrawElementOptions) {
  clearContext(ctx);
  drawBox(ctx, elem, elem.desc.bgColor || 'transparent');
  rotateElement(ctx, elem, () => {
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
          if (ctx.measureText(lineText + (tempText[i] || '')).width < ctx.$doPixelRatio(elem.w)) {
            lineText += tempText[i] || '';
          } else {
            lines.push({
              text: lineText,
              width: ctx.$undoPixelRatio(ctx.measureText(lineText).width)
            });
            lineText = tempText[i] || '';
            lineNum++;
          }
          if ((lineNum + 1) * fontHeight > elem.h) {
            break;
          }
          if (tempText.length - 1 === i) {
            if ((lineNum + 1) * fontHeight < elem.h) {
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
    if (lines.length * fontHeight < elem.h) {
      if (elem.desc.verticalAlign === 'top') {
        startY = 0;
      } else if (elem.desc.verticalAlign === 'bottom') {
        startY += elem.h - lines.length * fontHeight;
      } else {
        // middle and default
        startY += (elem.h - lines.length * fontHeight) / 2;
      }
    }

    // draw text lines
    {
      const _y = elem.y + startY;
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
        let _x = elem.x;
        if (desc.textAlign === 'center') {
          _x = elem.x + (elem.w - line.width) / 2;
        } else if (desc.textAlign === 'right') {
          _x = elem.x + (elem.w - line.width);
        }
        ctx.fillText(line.text, _x, _y + fontHeight * i);
      });
      clearContext(ctx);
    }

    // draw text stroke
    if (isColorStr(desc.strokeColor) && desc.strokeWidth !== undefined && desc.strokeWidth > 0) {
      const _y = elem.y + startY;
      lines.forEach((line, i) => {
        let _x = elem.x;
        if (desc.textAlign === 'center') {
          _x = elem.x + (elem.w - line.width) / 2;
        } else if (desc.textAlign === 'right') {
          _x = elem.x + (elem.w - line.width);
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

// export function createTextSVG(elem: DataElement<'text'>): string {
//   const svg = `
//   <svg xmlns="http://www.w3.org/2000/svg" width="${elem.w}" height = "${elem.h}">
//     <foreignObject width="100%" height="100%">
//       <div xmlns = "http://www.w3.org/1999/xhtml" style="font-size: ${elem.desc.size}px; color:${elem.desc.color};">
//         <span>${elem.desc.text || ''}</span>
//       </div>
//     </foreignObject>
//   </svg>
//   `;
//   return svg;
// }
