import type { Element, ElementType, Data, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { drawCircle } from './circle';
import { drawRect } from './rect';
import { drawImage } from './image';
import { drawText } from './text';
import { drawSVG } from './svg';
import { drawHTML } from './html';
import { drawGroup } from './group';

export function drawElement(ctx: ViewContext2D, elem: Element<ElementType>, opts: RendererDrawElementOptions) {
  try {
    switch (elem.type) {
      case 'rect': {
        drawRect(ctx, elem as Element<'rect'>, opts);
        break;
      }
      case 'circle': {
        drawCircle(ctx, elem as Element<'circle'>, opts);
        break;
      }
      case 'text': {
        drawText(ctx, elem as Element<'text'>, opts);
        break;
      }
      case 'image': {
        drawImage(ctx, elem as Element<'image'>, opts);
        break;
      }
      case 'svg': {
        drawSVG(ctx, elem as Element<'svg'>, opts);
        break;
      }
      case 'html': {
        drawHTML(ctx, elem as Element<'html'>, opts);
        break;
      }
      case 'group': {
        drawGroup(ctx, elem as Element<'group'>, opts);
        break;
      }
      default: {
        break;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export function drawElementList(ctx: ViewContext2D, elements: Data['elements'], opts: RendererDrawElementOptions) {
  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i];
    // TODO
    if (!opts.calculator.isElementInView(elem, opts.viewScaleInfo, opts.viewSizeInfo)) {
      continue;
    }
    try {
      drawElement(ctx, elem, opts);
    } catch (err) {
      console.error(err);
    }
  }
}
