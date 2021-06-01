import {
  TypeContext,
  TypeElement,
  TypeElemDesc,
  // TypePoint,
} from '@idraw/types';
import { rotateElement } from '../transform';
import Loader from '../loader';
 

export function drawImage<T extends keyof TypeElemDesc>(
  ctx: TypeContext,
  elem: TypeElement<T>,
  loader: Loader,
) {
  // const desc = elem.desc as TypeElemDesc['rect'];
  const content = loader.getContent(elem.uuid);
  rotateElement(ctx, elem, () => {
    // ctx.setFillStyle(desc.color);
    // ctx.fillRect(elem.x, elem.y, elem.w, elem.h);
    if (content) {
      // ctx.drawImage(content, 0, 0, elem.w, elem.h, elem.x, elem.y, elem.w, elem.h);
      ctx.drawImage(content, elem.x, elem.y, elem.w, elem.h);
    }
  });
}


