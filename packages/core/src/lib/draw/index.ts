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
import {
  drawElementWrapper, drawAreaWrapper, drawElementListWrappers,
} from './wrapper';

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

  if (typeof data.bgColor === 'string' && isColorStr(data.bgColor)) {
    drawBgColor(ctx, data.bgColor);
  }

  if (!(data.elements.length > 0)) {
    return;
  }
  for (let i = data.elements.length - 1; i >= 0; i--) {
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
        drawImage(ctx, elem as TypeElement<'image'>, loader);
        break;
      }
      case 'svg': {
        drawSVG(ctx, elem as TypeElement<'svg'>, loader);
        break;
      }
      default: {
        // nothing
        break;
      }
    }
  }
  
  drawElementWrapper(ctx, helperConfig);
  drawAreaWrapper(ctx, helperConfig);
  drawElementListWrappers(ctx, helperConfig);
}

