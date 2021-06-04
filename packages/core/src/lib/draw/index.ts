import {
  TypeContext,
  TypeData,
  TypeElement,
  TypeHelperConfig,
  // TypePoint,
} from '@idraw/types';
import util from '@idraw/util';
import Loader from '../loader';
import { clearContext, drawBgColor } from './base';
import { drawRect } from './rect';
import { drawImage } from './image';
import { drawSVG } from './svg';
import { drawText } from './text';
import { drawElementWrapper } from './wrapper';

const { isColorStr } = util.color;

export function drawContext(
  ctx: TypeContext,
  data: TypeData,
  helperConfig: TypeHelperConfig,
  loader: Loader,
): void {
  clearContext(ctx);
  const size = ctx.getSize();
  ctx.clearRect(0, 0, size.width, size.height);

  drawElementWrapper(ctx, helperConfig);

  if (typeof data.bgColor === 'string' && isColorStr(data.bgColor)) {
    drawBgColor(ctx, data.bgColor);
  }
  for (let i = 0; i < data.elements.length; i++) {
    const elem = data.elements[i];
    switch (elem.type) {
      case 'rect': {
        drawRect(ctx, elem as TypeElement<'rect'>);
        break;
      }
      case 'text': {
        drawText(ctx, elem as TypeElement<'text'>, loader, helperConfig);
        break;
      }
      case 'image': {
        drawImage(ctx, elem as TypeElement<'image'>, loader, helperConfig);
        break;
      }
      case 'svg': {
        drawSVG(ctx, elem as TypeElement<'svg'>, loader, helperConfig);
        break;
      }
      default: {
        // nothing
        break;
      }
    }
  }
}

