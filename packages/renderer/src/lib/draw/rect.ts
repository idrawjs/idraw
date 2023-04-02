import { IDrawContext, DataElement } from '@idraw/types';
import { drawBox } from './base';

export function drawRect(ctx: IDrawContext, elem: DataElement<'rect'>) {
  drawBox(ctx, elem, elem.desc.bgColor as string);
}
