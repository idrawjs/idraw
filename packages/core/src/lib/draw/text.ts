import {
  TypeContext, 
  TypeElemDescText, 
  TypeElement,
  TypeHelperConfig,
} from '@idraw/types';
import Loader from '../loader';
import { clearContext, drawBox } from './base';
import { rotateElement } from './../transform';

export function drawText(
  ctx: TypeContext,
  elem: TypeElement<'text'>,
  loader: Loader,
  helperConfig: TypeHelperConfig
) {
  clearContext(ctx);
  drawBox(ctx, elem, elem.desc.bgColor);
  rotateElement(ctx, elem, () => {

    const desc: TypeElemDescText = {
      ...{
        fontSize: 12,
        fontFamily: 'sans-serif',
        textAlign: 'center',
      },
      ...elem.desc
    };
    ctx.setFillStyle(elem.desc.color);
    ctx.setTextBaseline('top');
    ctx.setFont({
      fontSize: desc.fontSize,
      fontFamily: desc.fontFamily
    });
    const fontHeight = desc.lineHeight || desc.fontSize;
    const lines: {text: string, width: number}[] = [];
    let lineText = '';
    let lineNum = 0;
    for (let i = 0; i < desc.text.length; i++) {
      
      if (ctx.measureText(lineText + (desc.text[i] || '')).width < ctx.calcDeviceNum(elem.w)) {
        lineText += (desc.text[i] || '');
      } else {
        lines.push({
          text: lineText,
          width: ctx.calcScreenNum(ctx.measureText(lineText).width),
        });
        lineText = (desc.text[i] || '');
        lineNum ++;
      }
      if ((lineNum + 1) * fontHeight > elem.h) {
        break;
      }
      if (lineText && desc.text.length - 1 === i) {
        if ((lineNum + 1) * fontHeight < elem.h) {
          lines.push({
            text: lineText,
            width: ctx.calcScreenNum(ctx.measureText(lineText).width),
          });
          break;
        }
      }
    }

    // draw text lines
    let _y = elem.y;
    if (lines.length * fontHeight < elem.h) {
      _y += ((elem.h - lines.length * fontHeight) / 2);
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

  });
}



// export function createTextSVG(elem: TypeElement<'text'>): string {
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
 

