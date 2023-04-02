import {
  IDrawContext,
  IDrawData,
  DataElement
  // Point,
} from '@idraw/types';
import { isColorStr } from '@idraw/util';
import Loader from '../loader';
import { clearContext, drawBgColor } from './base';
import { drawRect } from './rect';
import { drawImage } from './image';
import { drawSVG } from './svg';
import { drawHTML } from './html';
import { drawText } from './text';
import { drawCircle } from './circle';

export function drawContext(
  ctx: IDrawContext,
  data: IDrawData,
  loader: Loader
): void {
  clearContext(ctx);
  const size = ctx.getSize();
  ctx.clearRect(0, 0, size.contextWidth, size.contextHeight);

  if (typeof data.bgColor === 'string' && isColorStr(data.bgColor)) {
    drawBgColor(ctx, data.bgColor);
  }

  if (!(data.elements.length > 0)) {
    return;
  }
  for (let i = 0; i < data.elements.length; i++) {
    const elem = data.elements[i];
    if (elem?.operation?.invisible === true) {
      continue;
    }
    switch (elem.type) {
      case 'rect': {
        drawRect(ctx, elem as DataElement<'rect'>);
        break;
      }
      case 'text': {
        drawText(ctx, elem as DataElement<'text'>, loader);
        break;
      }
      case 'image': {
        drawImage(ctx, elem as DataElement<'image'>, loader);
        break;
      }
      case 'svg': {
        drawSVG(ctx, elem as DataElement<'svg'>, loader);
        break;
      }
      case 'html': {
        drawHTML(ctx, elem as DataElement<'html'>, loader);
        break;
      }
      case 'circle': {
        drawCircle(ctx, elem as DataElement<'circle'>);
        break;
      }
      default: {
        // nothing
        break;
      }
    }
  }
}
