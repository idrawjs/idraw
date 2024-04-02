import { IDrawContext, DataElemDescText, DataElement } from '@idraw/types';
import { is, isColorStr } from '@idraw/util';
import Loader from '../loader';
import { clearContext, drawBox } from './base';
import { rotateElement } from './../transform';

export function drawText(
  ctx: IDrawContext,
  elem: DataElement<'text'>,
  loader: Loader
) {
  clearContext(ctx);
  drawBox(ctx, elem, elem.desc.bgColor || 'transparent');
  rotateElement(ctx, elem, () => {
    const desc: DataElemDescText = {
      ...{
        fontSize: 12,
        fontFamily: 'sans-serif',
        textAlign: 'center'
      },
      ...elem.desc
    };
    ctx.setFillStyle(elem.desc.color);
    ctx.setTextBaseline('top');
    ctx.setFont({
      fontWeight: desc.fontWeight,
      fontSize: desc.fontSize,
      fontFamily: desc.fontFamily
    });
    const descText = desc.text.replace(/\r\n/gi, '\n');
    const fontHeight = desc.lineHeight || desc.fontSize;
    const descTextList = descText.split('\n');
    const lines: { text: string; width: number }[] = [];
    const lineSpacing = desc.lineSpacing || 0;

    let lineNum = 0;
    descTextList.forEach((tempText: string, idx: number) => {
      let lineText = '';

      if (tempText.length > 0) {
        for (let i = 0; i < tempText.length; i++) {
          if (
            ctx.measureText(lineText + (tempText[i] || '')).width <
            ctx.calcDeviceNum(elem.w)
          ) {
            lineText += tempText[i] || '';
          } else if (ctx.measureText(lineText + (tempText[i] || '')).width == ctx.calcDeviceNum(elem.w)) {
            lineText += tempText[i] || '';
            lines.push({
              text: lineText,
              width: ctx.calcScreenNum(ctx.measureText(lineText).width)
            });
            lineText = '';
            lineNum++;
          } else {
            lines.push({
              text: lineText,
              width: ctx.calcScreenNum(ctx.measureText(lineText).width)
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
                width: ctx.calcScreenNum(ctx.measureText(lineText).width)
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
    if (lines.length * fontHeight + (lines.length > 1 ? (lines.length - 1) * lineSpacing : 0) < elem.h) {
      if (elem.desc.verticalAlign === 'top') {
        startY = 0;
      } else if (elem.desc.verticalAlign === 'bottom') {
        startY += elem.h - lines.length * fontHeight - (lines.length > 1 ? (lines.length - 1) * lineSpacing : 0);
      } else {
        // middle and default
        startY += (elem.h - lines.length * fontHeight - (lines.length > 1 ? (lines.length - 1) * lineSpacing : 0)) / 2;
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
        ctx.fillText(line.text, _x, _y + fontHeight * i + i * lineSpacing);
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
