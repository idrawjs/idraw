import {
  TypeContext, 
  TypeElemDescText, 
  TypeElement,
  TypeHelperConfig,
} from '@idraw/types';
import Loader from '../loader';
import { clearContext, drawBoxBorder } from './base';
import { rotateElement } from './../transform';

export function drawText(
  ctx: TypeContext,
  elem: TypeElement<'text'>,
  loader: Loader,
  helperConfig: TypeHelperConfig
) {
  clearContext(ctx);
  drawBoxBorder(ctx, elem);
  rotateElement(ctx, elem, () => {

    const desc: TypeElemDescText = {
      ...{
        fontSize: 12,
        fontFamily: 'sans-serif',
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
    
    let lineText = '';
    let lineNum = 0;
    for (let i = 0; i < desc.text.length; i++) {
      
      if (ctx.measureText(lineText + (desc.text[i] || '')).width < ctx.calcDeviceNum(elem.w)) {
        lineText += (desc.text[i] || '');
      } else {
        ctx.fillText(lineText, elem.x, elem.y + lineNum * fontHeight);
        lineText = '';
        lineNum ++;
      }
      if ((lineNum + 1) * fontHeight > elem.h) {
        break;
      }
      if (lineText && desc.text.length - 1 === i) {
        if ((lineNum + 1) * fontHeight < elem.h) {
          ctx.fillText(lineText, elem.x, elem.y + lineNum * fontHeight);
          break;
        }
      }
    }
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
 

