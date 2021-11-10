import {
  TypeContext, 
  TypeElement,
} from '@idraw/types';
import { rotateElement } from '../transform';
import Loader from '../loader';
 

export function drawHTML(
  ctx: TypeContext,
  elem: TypeElement<'html'>,
  loader: Loader,
) {
  const content = loader.getContent(elem.uuid);
  rotateElement(ctx, elem, () => {
    if (content) {
      ctx.drawImage(content, elem.x, elem.y, elem.w, elem.h);
    }
  });
}
