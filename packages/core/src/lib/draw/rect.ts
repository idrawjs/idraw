import {
  TypeContext,
  TypeElement,
} from '@idraw/types';
import { drawBox } from './base';
 
export function drawRect(ctx: TypeContext, elem: TypeElement<'rect'>) {
  drawBox(ctx, elem, elem.desc.color as string);
}

 

 