import type { Element, ElementType, Data, RendererDrawElementOptions } from '@idraw/types';
import { drawCircle } from './circle';
import { drawRect } from './rect';
import { drawImage } from './image';

export function drawElement(ctx: CanvasRenderingContext2D, elem: Element<ElementType>, opts: RendererDrawElementOptions) {
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
      case 'image': {
        drawImage(ctx, elem as Element<'image'>, opts);
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

export function drawElementList(ctx: CanvasRenderingContext2D, elements: Data['elements'], opts: RendererDrawElementOptions) {
  for (let i = elements.length - 1; i >= 0; i--) {
    const elem = elements[i];
    if (!opts.calculator.isElementInView(elem, opts)) {
      continue;
    }
    try {
      drawElement(ctx, elem, opts);
    } catch (err) {
      console.error(err);
    }
  }
}
