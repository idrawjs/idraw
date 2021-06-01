import {
  TypeContext,
  TypeElement,
  TypeElemDesc,
} from '@idraw/types';
import { rotateElement } from '../transform';
import { clearContext } from './base';
 
export function drawRect<T extends keyof TypeElemDesc>(ctx: TypeContext, elem: TypeElement<T>) {
  clearContext(ctx);
  const desc = elem.desc as TypeElemDesc['rect'];
  rotateElement(ctx, elem, () => {
    ctx.setFillStyle(desc.color);
    ctx.fillRect(elem.x, elem.y, elem.w, elem.h);
  });
}

 

 